import fs from "fs";
import path from "path";
import { logSuccess, logWarn, logError } from "./logger.js";

async function loadPlugins() {
  const plugins = [];
  const pluginsDir = path.join(process.cwd(), "plugins");

  const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith(".js"));

  for (const file of files) {
    try {
      const pluginModule = await import(`file://${path.join(pluginsDir, file)}`);
      const plugin = pluginModule.default;

      if (plugin && plugin.name && plugin.execute) {
        plugins.push(plugin);
        logSuccess(`Plugin loaded: ${plugin.name}`);
      } else {
        logWarn(`Skipped ${file} (invalid format)`);
      }
    } catch (err) {
      logError(`Failed to load ${file}`, err);
    }
  }

  return plugins;
}

export { loadPlugins };
