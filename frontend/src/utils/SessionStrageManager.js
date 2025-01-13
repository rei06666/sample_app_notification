class SessionStorageManager {
    /**
     * セッションストレージに値を設定
     * @param {string} key - 保存するキー
     * @param {*} value - 保存する値 (JSON 形式に変換)
     */
    static set(key, value) {
      if (!key) throw new Error("キーは必須です");
      sessionStorage.setItem(key, JSON.stringify(value));
    }
  
    /**
     * セッションストレージから値を取得
     * @param {string} key - 取得するキー
     * @returns {*} 保存された値 (オブジェクトまたはプリミティブ)
     */
    static get(key) {
      if (!key) throw new Error("キーは必須です");
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
  
    /**
     * セッションストレージの値を削除
     * @param {string} key - 削除するキー
     */
    static remove(key) {
      if (!key) throw new Error("キーは必須です");
      sessionStorage.removeItem(key);
    }
  
    /**
     * セッションストレージをすべてクリア
     */
    static clear() {
      sessionStorage.clear();
    }
  }
  
export default SessionStorageManager;