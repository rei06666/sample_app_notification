import React, { useEffect, useState } from 'react';
import SessionStorageManager from '../utils/SessionStrageManager'
import { useNavigate } from 'react-router-dom';
import checkSession from '../utils/SessionCheck';

const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const username = SessionStorageManager.get("username");


const NotificationPage = () => {
  let navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('MON'); // 現在選択されているタブ
  const [notifications, setNotifications] = useState({}); // 各日の通知データ
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const authorize = async () => {
      try {
        const response = await checkSession()
        if (!response){
          navigate("/")
        }
      } catch (e) {
        console.error(e)
        navigate("/")
      }
    }

    const listNotification = async () => {
      const response = await readNotifications()
      if(response.ok){
        const responseData = await response.json();
        const notificationData = responseData.notifications
        let updatedNotifications = {}

        notificationData.forEach(notification => {
          var { notification_time: tmptime, message: tmpmessage, phone: tmpphone, day_of_week: tmpday } = notification;
          updatedNotifications = {
            ...updatedNotifications,
            [tmpday]: [
              ...(updatedNotifications[tmpday] || []),
              { time: tmptime,
                message: tmpmessage,
                phone: tmpphone
              }
            ],
          };
        })
        setNotifications(updatedNotifications);
      } 
    }
    authorize()
    listNotification()
  }, [])

  // 通知追加処理
  const handleAddNotification = async () => {
    if (!time || !message) return setErrorMessage("未入力の箇所があります"); 
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/notification/create`, {  
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          message: message,
          phone: phone,
          time: time,
          day: activeTab
        })
      });

      if(response.ok){
        // 新しい通知を追加
        var updatedNotifications = {
          ...notifications,
          [activeTab]: [
            ...(notifications[activeTab] || []),
            { time, message, phone }
          ],
        };
        setNotifications(updatedNotifications);
        setErrorMessage("")
        setTime(''); 
        setMessage('');
        setPhone('')
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('エラーが発生しました');
    }
  };

  const handleDeleteNotification = async (notification) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/notification/delete`, {  
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          message: notification.message,
          phone: notification.phone,
          time: notification.time,
          day: activeTab
        })
      });

      if(response.ok){
        const updatedNotifications = {
          ...notifications,
          [activeTab]: notifications[activeTab].filter(
            (notif) => notif.time !== notification.time || notif.message !== notification.message || notif.phone !== notification.phone
          ),
        };
        setNotifications(updatedNotifications);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('削除中にエラーが発生しました');
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <div className=" p-4">
    {/* タブ */}
    <div className="flex mb-4 space-x-2">
      {days.map((day) => (
        <button
          key={day}
          className={`px-4 py-2 rounded border w-full ${
            activeTab === day
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-gray-200 text-gray-800 border-gray-400'
          }`}
          onClick={() => setActiveTab(day)}
        >
          {day}
        </button>
      ))}
    </div>

    {/* 通知追加フォーム */}
    <div className="p-4 mb-4 bg-white border rounded shadow-md">
      <h2 className="mb-1 font-medium">通知を追加</h2>
      {errorMessage && (
                <div className="p-2 mb-4 text-sm text-red-600 rounded">
                    {errorMessage}
                </div>
      )}
      <div className="mb-2 ">
        {/* 時間選択 */}
        <div>
          <label className="block mb-1 text-sm font-medium">時間</label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-2 py-3 border rounded"
          >
            <option value="">選択してください</option>
            {[...Array(24 * 12)].map((_, i) => {
              const hours = String(Math.floor(i / 12)).padStart(2, '0');
              const minutes = String((i % 12) * 5).padStart(2, '0');
              const value = `${hours}:${minutes}`;
              return (
                <option key={value} value={value}>
                  {value}
                </option>
              );
            })}
          </select>
        </div>
        {/* メッセージ入力 */}
        <div>
          <label className="block mb-1 text-sm font-medium">メッセージ</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-2 py-3 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">電話番号(SNSに通知されます)</label>
          <input
            type="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-2 py-3 border rounded"
          />
        </div>
      </div>
      <button
        onClick={handleAddNotification}
        className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
      >
        追加
      </button>
    </div>

    {/* 通知リスト */}
    <div className="p-4 bg-white border rounded shadow-md">
      <h2 className="mb-2 text-xl font-medium">
        {activeTab} の通知リスト
      </h2>
      <ul>
        {(notifications[activeTab] || []).length === 0 ? (
          <li className="px-2 py-1 text-gray-500 text-center">Nothing</li>
        ) : (
          notifications[activeTab].map((notification, index) => (
            <li
              key={index}
              className="flex flex-col px-4 py-2 mb-2 bg-gray-100 border rounded"
            >
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Time:</span>
                <span>{notification.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Message:</span>
                <span>{notification.message}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Phone:</span>
                <span>{notification.phone}</span>
              </div>
              <button
                className="px-3 py-1 ml-4 text-white bg-red-500 rounded hover:bg-red-600"
                onClick={() => handleDeleteNotification(notification)}
              >
                Delete
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  </div>
</div>

  );
};

const readNotifications = async () => {
  try {
    const response = await fetch(`{process.env.REACT_APP_BACKEND_URL}/notification/read`, {  
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
      })
    });
    return response
  } catch (error){
    console.error('Error:', error);
  }
}
export default NotificationPage;
