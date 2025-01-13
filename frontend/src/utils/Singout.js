import SessionStorageManager from './SessionStrageManager'

const signOut = () => {
    // 認証情報をクリア
    SessionStorageManager.clear();
};
  
export default signOut