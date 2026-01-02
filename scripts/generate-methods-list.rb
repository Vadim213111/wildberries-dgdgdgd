#!/usr/bin/env ruby
# frozen_string_literal: true

require "yaml"
require "pathname"

ROOT_DIR = Pathname.new(__dir__).parent
CONFIG_FILE = ROOT_DIR / "generation.yaml"
SPECS_DIR = ROOT_DIR / "specs"
README_FILE = ROOT_DIR / "README.md"

START_MARKER = "<!-- METHODS_LIST_START -->"
END_MARKER = "<!-- METHODS_LIST_END -->"

METHOD_ORDER = {
  "get" => 0,
  "post" => 1,
  "put" => 2,
  "patch" => 3,
  "delete" => 4,
  "head" => 5,
  "options" => 6,
  "trace" => 7,
}.freeze

def normalize(text)
  text.to_s.gsub(/\s+/, " ").strip
end

def specs_in_order(config_file, specs_dir)
  config = YAML.load_file(config_file) || {}
  spec_entries = config["specs"] || []

  spec_paths = spec_entries.map do |entry|
    next unless entry.is_a?(String)

    local_path = specs_dir / File.basename(entry)
    local_path.to_s if local_path.exist?
  end.compact

  if spec_paths.empty?
    spec_paths = Dir[specs_dir.join("*.yaml").to_s].sort
  end

  spec_paths
end

def build_section(spec_path)
  spec = YAML.load_file(spec_path) || {}
  title = normalize(spec.dig("info", "title"))
  title = File.basename(spec_path) if title.empty?

  operations = []
  paths = spec["paths"] || {}
  paths.each do |path, path_item|
    next unless path_item.is_a?(Hash)

    path_item.each do |method, operation|
      next unless METHOD_ORDER.key?(method)
      next unless operation.is_a?(Hash)

      summary = normalize(operation["summary"])
      summary = normalize(operation["description"]) if summary.empty?
      operation_id = normalize(operation["operationId"])

      operations << {
        path: path,
        method: method,
        summary: summary,
        operation_id: operation_id,
      }
    end
  end

  operations.sort_by! { |op| [op[:path], METHOD_ORDER[op[:method]]] }

  lines = operations.map do |op|
    line = +"- `#{op[:method].upcase} #{op[:path]}`"
    extras = []
    extras << op[:summary] unless op[:summary].empty?
    extras << "(#{op[:operation_id]})" unless op[:operation_id].empty?
    line << " — #{extras.join(' ')}" unless extras.empty?
    line
  end

  header = "### #{title} (`#{File.basename(spec_path)}`)"
  ([header] + lines).join("\n")
end

def build_methods_list
  spec_paths = specs_in_order(CONFIG_FILE, SPECS_DIR)
  sections = spec_paths.map { |spec_path| build_section(spec_path) }
  sections.join("\n\n")
end

def insert_markers_if_missing(readme)
  return readme if readme.include?(START_MARKER) && readme.include?(END_MARKER)

  insertion = "#{START_MARKER}\n#{END_MARKER}\n"
  heading = readme.match(/^##\s+/)

  if heading
    idx = heading.begin(0)
    readme[0...idx] + insertion + readme[idx..]
  else
    readme + "\n" + insertion
  end
end

def update_readme(methods_list)
  readme = README_FILE.read
  readme = insert_markers_if_missing(readme)

  block = "#{START_MARKER}\n#{methods_list}\n#{END_MARKER}"
  readme = readme.sub(/#{Regexp.escape(START_MARKER)}.*?#{Regexp.escape(END_MARKER)}/m, block)
  readme << "\n" unless readme.end_with?("\n")

  README_FILE.write(readme)
end

methods_list = build_methods_list
update_readme(methods_list)
