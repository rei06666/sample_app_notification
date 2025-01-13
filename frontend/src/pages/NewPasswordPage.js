import React from 'react';
import { useForm } from "react-hook-form";
import SessionStorageManager from '../utils/SessionStrageManager'

const NewPasswordPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const username = SessionStorageManager.get("username");
      const session = SessionStorageManager.get("session");
      const email = SessionStorageManager.get("email")
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/sessions/new_password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          new_password: data.password,
          username: username,
          session: session,
          email: email
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        window.location.reload(); // ログイン画面に戻る
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
        <form className="w-96 p-8 bg-white rounded-lg shadow-md" onSubmit={handleSubmit(onSubmit)}>
            <h1 className="mb-4 text-2xl font-medium text-grey-700">新しいパスワードを設定してください</h1>
            <div className="mb-4">
                <label className="block text-sm font-medium text-grey-600">新しいパスワード</label>
                <input
                    {...register("password", {
                        required: "必須です",
                    })}
                    type="password"
                    className="w-full p-2 mt-1 border-2 rounded-md"
                />
                {errors.name && <div className="text-sm text-red-600">入力が必須の項目です</div>}
            </div>
            <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700">
                    設定
                </button>
            </div>
        </form>
    </div>
  );
};

export default NewPasswordPage;
