import SessionStorageManager from './SessionStrageManager'
import { useNavigate } from 'react-router-dom';


const checkSession = async () => {
    const token = SessionStorageManager.get("access_token")
    // アクセストークンが存在し、有効であれば認証状態にする
    if (await isTokenExpired(token)) {
      return true
    } else {
      return false
    }
}

// トークンが期限切れかどうかをチェックする
const isTokenExpired = async (access_token) => {
    try{
        const resp = await fetch(`${process.env.REACT_APP_BACKEND_URL}/sessions/check`, {  
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            access_token: access_token
            }),
        });
        if (resp.ok){
            return true
        }
        return false
    }
    catch (error){
        console.error('Error:', error);
        return false
    }
};

export default checkSession;
