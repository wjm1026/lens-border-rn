const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Custom resolver to fix lucide-react-native resolution issues
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName.startsWith('lucide-react-native/dist/esm/icons/')) {
        const iconName = moduleName.split('/').pop();
        // Fallback to CJS icons if ESM icons are missing or failing
        return context.resolveRequest(
          context,
          `lucide-react-native/dist/cjs/icons/${iconName}`,
          platform,
        );
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
