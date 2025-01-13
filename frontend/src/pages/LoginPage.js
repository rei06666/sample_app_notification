// src/components/LoginForm.js
import React from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import SessionStorageManager from '../utils/SessionStrageManager'
import { useState } from 'react';

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/sessions`, {  
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,  // フォームのユーザー名フィールド
          password: data.password,  // フォームのパスワードフィールド
          email: data.email  // フォームのEmailフィールド
        }),
      });
      const responseData = await response.json();

      if(response.ok) {
        SessionStorageManager.set("username", data.name);
        SessionStorageManager.set("email", data.email)
        SessionStorageManager.set("access_token", responseData.access_token)

        // 初回ログイン時はパスワード変更が必要
        if (responseData.message === "新しいパスワードが必要です") {
          SessionStorageManager.set("session", responseData.session);
          navigate("/new-password", {});
        }

        navigate("/home", {});
      } else {
        setErrorMessage("ユーザー名またはパスワードが正しくありません。");
      } 
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(`${error.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
        <form className="w-96 p-8 bg-white rounded-lg shadow-md" onSubmit={handleSubmit(onSubmit)}>
            <h1 className="mb-4 text-2xl font-medium text-grey-700">ログイン</h1>
            {errorMessage && (
                <div className="p-2 mb-4 text-sm text-red-600 rounded">
                    {errorMessage}
                </div>
            )}
            <div className="mb-4">
                <label className="block text-sm font-medium text-grey-600">ユーザー名</label>
                <input
                    {...register("name", {
                        required: "ユーザー名は必須です",
                    })}
                    type="name"
                    className="w-full p-2 mt-1 border-2 rounded-md"
                />
                {errors.name && <div className="text-sm text-red-600">入力が必須の項目です</div>}
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-grey-600">パスワード</label>
                <input
                    {...register("password", {
                        required: "パスワードは必須です"
                    })}
                    type="password"
                    className="w-full p-2 mt-1 border-2 rounded-md"
                />
                {errors.password && (
                    <span className="text-sm text-red-600">{errors.password.message}</span>
                )}
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-grey-600">メールアドレス</label>
                <input
                    {...register("email", {
                        required: "メールアドレスは必須です",
                    })}
                    type="email"
                    className="w-full p-2 mt-1 border-2 rounded-md"
                />
                {errors.name && <div className="text-sm text-red-600">入力が必須の項目です</div>}
            </div>
            <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700">
                    ログイン
                </button>
            </div>
        </form>
    </div>
);
};

export default LoginPage;
