/*
 * @Author: wjm 791215714@qq.com
 * @Date: 2026-01-12 04:41:20
 * @LastEditors: wjm 791215714@qq.com
 * @LastEditTime: 2026-01-12 22:11:39
 * @FilePath: /code/lens-border-rn/metro.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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
