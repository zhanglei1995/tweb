/*
 * https://github.com/morethanwords/tweb
 * Copyright (C) 2019-2021 Eduard Kuzmenko
 * https://github.com/morethanwords/tweb/blob/master/LICENSE
 */

import {AppManager} from './manager';
import {HelpCountriesList} from '../../layer';
import App from '../../config/app';

export class AppLangPackManager extends AppManager {
  protected after() {
    this.apiUpdatesManager.addMultipleEventsListeners({
      updateLangPack: (update) => {
        this.rootScope.dispatchEvent('langpack_update', update);
      },
      updateLangPackTooLong: (update) => {
        this.rootScope.dispatchEvent('langpack_update_too_long', update);
      }
    });
  }

  public getLangPack(langCode: string, langPack: string, ignoreCache?: boolean) {
    console.log(`%c[MTProto API] 调用 langpack.getLangPack`, 'color: #9b59b6', {
      语言代码: langCode,
      语言包类型: langPack,
      忽略缓存: ignoreCache,
      时间戳: new Date().toISOString()
    });
    
    const startTime = performance.now();
    
    return this.apiManager.invokeApiCacheable('langpack.getLangPack', {
      lang_code: langCode,
      lang_pack: langPack
    }, {override: ignoreCache}).then((result) => {
      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);
      const durationNum = parseFloat(duration);
      
      console.log(`%c[MTProto API] langpack.getLangPack 完成`, 'color: #27ae60', {
        语言代码: langCode,
        耗时: `${duration}ms`,
        字符串数量: result.strings?.length || 0,
        版本: result.version,
        是否来自缓存: durationNum < 50 ? '是 (响应过快)' : '否 (从服务器获取)'
      });
      
      return result;
    }).catch((error) => {
      console.error(`%c[MTProto API] langpack.getLangPack 失败`, 'color: #e74c3c', {
        语言代码: langCode,
        错误: error
      });
      throw error;
    });
  }

  public getCountriesList(langCode: string, ignoreCache?: boolean) {
    return this.apiManager.invokeApiCacheable('help.getCountriesList', {
      lang_code: langCode,
      hash: 0
    }, {override: ignoreCache}) as Promise<HelpCountriesList.helpCountriesList>;
  }

  public getStrings(langCode: string, strings: string[]) {
    return this.apiManager.invokeApi('langpack.getStrings', {
      lang_pack: App.langPack,
      lang_code: langCode,
      keys: strings
    });
  }

  public getDifference(langCode: string, fromVersion: number) {
    return this.apiManager.invokeApi('langpack.getDifference', {
      lang_code: langCode,
      from_version: fromVersion,
      lang_pack: App.langPack
    });
  }
}
