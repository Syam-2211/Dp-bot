async function loadPlugins() {
  const plugins = {};
  const pluginDir = path.join(__dirname, "plugins");

  const files = fs.readdirSync(pluginDir).filter((file) => file.endsWith(".js"));

  for (const file of files) {
    try {
      const pluginPath = path.join(pluginDir, file);
      const plugin = await import(pluginPath);
      plugins[plugin.default.name] = plugin.default;
      console.log(`✅ Plugin loaded: ${plugin.default.name}`);
    } catch (err) {
      console.warn(`⚠️ Failed to load plugin ${file}:`, err.message);
    }
  }

  return plugins;
}
