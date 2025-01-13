require 'aws-sdk-cognitoidentityprovider'
require 'dotenv/load'

class SessionsController < ApplicationController
  def create
    # Cognitoの設定
    client = Aws::CognitoIdentityProvider::Client.new()

    # ユーザー名とパスワードを受け取る
    name = params[:name]
    password = params[:password]
    email = params[:email]

    begin
      # 認証リクエストをCognitoに送信
      resp = client.initiate_auth({
        auth_flow: "USER_PASSWORD_AUTH",
        client_id: ENV['AWS_COGNITO_CLIENT_ID'], # アプリクライアントID
        auth_parameters: {
          "USERNAME": name,
          "PASSWORD": password,
          "userAttributes.email": email
        },
      })

      session = resp.session

      # 認証成功の場合
      if resp.authentication_result
        access_token = resp.authentication_result.access_token
        render json: { 
          message: "ログイン成功", 
          access_token: access_token, 
        }, status: :ok
      elsif resp.challenge_name == "NEW_PASSWORD_REQUIRED"
        render json: { 
          message: "新しいパスワードが必要です", 
          session: session
        }, status: :ok
      end
    rescue Aws::CognitoIdentityProvider::Errors::NotAuthorizedException => e
      render json: { error: "認証に失敗しました: #{e.message}" }, status: :unauthorized
    rescue => e
      render json: { error: "エラーが発生しました: #{e.message}" }, status: :internal_server_error
    end
  end

  # 新しいパスワードを設定するエンドポイント
  def new_password
    client = Aws::CognitoIdentityProvider::Client.new
    new_password = params[:new_password]
    username = params[:username]
    session = params[:session]
    email = params[:email]

    begin
      resp = client.respond_to_auth_challenge({
        client_id: ENV['AWS_COGNITO_CLIENT_ID'],
        challenge_name: "NEW_PASSWORD_REQUIRED",
        session: session,
        challenge_responses: {
          "USERNAME" => username,
          "NEW_PASSWORD" => new_password,
          "userAttributes.email" => email
        },
      })

      render json: { message: "新しいパスワードが設定されました" }, status: :ok
    rescue Aws::CognitoIdentityProvider::Errors::InvalidPasswordException => e
      render json: { error: "パスワードが無効です: #{e.message}" }, status: :unprocessable_entity
    rescue => e
      render json: { error: "エラーが発生しました: #{e.message}" }, status: :internal_server_error
    end
  end

  # トークンの有効期限確認
  def check
    client = Aws::CognitoIdentityProvider::Client.new
    access_token = params[:access_token]
  
    begin
      # get_userを使用して、アクセストークンが有効かどうかを確認
      resp = client.get_user({
        access_token: access_token
      })
      
      # アクセストークンが有効であれば、ユーザー情報が返ってくる
      # ここで得られた情報をもとに必要な処理を行うことができます
      render json: { success: true, user_info: resp.to_h }
    rescue Aws::CognitoIdentityProvider::Errors::NotAuthorizedException => e
      # アクセストークンが無効な場合、NotAuthorizedExceptionが発生
      render json: { success: false, message: 'Invalid or expired access token' }, status: :unauthorized
    rescue Aws::CognitoIdentityProvider::Errors::ServiceError => e
      # 他のエラーが発生した場合
      render json: { success: false, message: "Error: #{e.message}" }, status: :internal_server_error
    end
  end  
end