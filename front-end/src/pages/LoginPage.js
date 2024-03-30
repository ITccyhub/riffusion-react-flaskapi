import React from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import ApiUtil from '../Utils/ApiUtil';
import HttpUtil from '../Utils/HttpUtil';
import { message } from 'antd';

const App = () => {
  const navigate = useNavigate();

  const onFinish = (values) => {
    const { username, password } = values;

    HttpUtil.post(ApiUtil.API_LOGIN, { username, password })
    .then(response => {
      console.log(response);
      
      // 判断登录成功
      if (response.code === 0) {
        const userCookie = `user=${JSON.stringify(response.user)}; path=/;`;
        document.cookie = userCookie;
        //取出 user
        // 登录成功，导航到 /home 页面
        navigate('/home');
      } else {
        // 登录失败，弹出密码错误提示框
        message.error('密码错误，请重试');
      }
    })
    .catch(error => {
      // 处理请求错误
      console.error('登录请求出错:', error);
      // 这里可以根据实际情况处理请求出错的情况，比如显示错误提示等
    });
  
  
  };

  return (
    <Form
      name="normal_login"
      className="login-form"
      initialValues={{
        remember: true,
      }}
      onFinish={onFinish}
    >
      <Form.Item
        name="username"
        rules={[
          {
            required: true,
            message: 'Please input your Username!',
          },
        ]}
      >
        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[
          {
            required: true,
            message: 'Please input your Password!',
          },
        ]}
      >
        <Input
          prefix={<LockOutlined className="site-form-item-icon" />}
          type="password"
          placeholder="Password"
        />
      </Form.Item>
      <Form.Item>
        <Form.Item name="remember" valuePropName="checked" noStyle>
          <Checkbox>Remember me</Checkbox>
        </Form.Item>

        <a className="login-form-forgot" href="">
          Forgot password
        </a>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" className="login-form-button">
          Log in
        </Button>
        Or <a href="">register now!</a>
      </Form.Item>
    </Form>
  );
};

export default App;
