/*
 * @Author: wjm 791215714@qq.com
 * @Date: 2026-01-12 00:47:08
 * @LastEditors: wjm 791215714@qq.com
 * @LastEditTime: 2026-01-12 01:29:11
 * @FilePath: /code/lens-border-rn/src/screens/EditorScreen/styles.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {StyleSheet} from 'react-native';

import {colors} from '../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  previewContainer: {
    flex: 1,
    width: '100%',
  },
});
