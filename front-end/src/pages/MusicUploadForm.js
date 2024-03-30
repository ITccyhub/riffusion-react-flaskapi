import React, { useState } from 'react';
import { Form, Upload, Button, message, Switch } from 'antd';
import { UploadOutlined } from '@ant-design/icons'; // 使用正确的图标组件
import HttpUtil from '../Utils/HttpUtil'; // 导入 HttpUtil

function getCookie(cookieName) {
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(`${cookieName}=`)) {
      return decodeURIComponent(cookie.substring(cookieName.length + 1));
    }
  }
  return null;
}

// 使用示例


const MusicUploadForm = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    console.log('Form values:', values);
    try {
      setLoading(true);
      const formData = new FormData();
      console.log('values.music[0].originFileObj:', values.music[0].originFileObj);
      formData.append('file', values.music[0].originFileObj);
      
      if(values.public === undefined)
        values.public = false;
      formData.append('public', values.public);
      const userInfo = getCookie('user');
if (userInfo) {
  try {
    const user = JSON.parse(userInfo);
    console.log('User Info:', user);
    formData.append('userId', user[0]);
  } catch (error) {
    console.error('Error parsing user cookie:', error);
  }
 
}

      const response = await HttpUtil.postf('/api/v1/fileUpload', formData);
      setLoading(false);
      if (response.code === 0) {
        message.success('音乐上传成功！');
      } else {
        message.error('音乐上传失败！');
      }
    } catch (error) {
      setLoading(false);
      message.error('音乐上传失败！');
      console.error('上传音乐失败:', error);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  return (
    <Form
      name="music-upload-form"
      onFinish={onFinish}
    >
      <Form.Item
        name="music"
        label="选择音乐文件"
        valuePropName="fileList"
        getValueFromEvent={normFile}
        rules={[
          {
            required: true,
            message: '请选择要上传的音乐文件',
          },
        ]}
      >
        <Upload beforeUpload={() => false} maxCount={1}>
          <Button icon={<UploadOutlined />}>选择文件</Button>
        </Upload>
      </Form.Item>
      <Form.Item
        name="public"
        label="是否公开分享"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          上传
        </Button>
      </Form.Item>
    </Form>
  );
};

export default MusicUploadForm;
