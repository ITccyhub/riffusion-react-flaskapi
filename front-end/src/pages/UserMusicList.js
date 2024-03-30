
import React, { useState, useEffect } from 'react';
import { List, Button, message, Modal } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
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
const UserMusicList = () => {
  const [userMusicList, setUserMusicList] = useState([]);
  const [playModalVisible, setPlayModalVisible] = useState(false);
  const [selectedMusicId, setSelectedMusicId] = useState(null);
  const [currentMusicData, setCurrentMusicData] = useState(null);

  useEffect(() => {
    fetchUserMusicList();
  }, []);

  const fetchUserMusicList = async () => {
    try {
      const userInfo = getCookie('user');
      if (userInfo) {
        try {
          const user = JSON.parse(userInfo);
          const response = await HttpUtil.get('/api/v1/userMusic/'+user[0]);
          if (response.code === 0) {
            setUserMusicList(response.music_files);
          } else {
            message.error('获取音乐列表失败！');
          }
        } catch (error) {
          message.error('获取音乐列表失败！');
          console.error('获取音乐列表失败:', error);
        }
      }
    } catch (error) {
      message.error('获取音乐列表失败！');
      console.error('获取音乐列表失败:', error);
    }
  };

  const handlePlayMusic = async (musicId) => {
    try {
      const response = await HttpUtil.post('/api/v1/playMusic', { music_id: musicId });
      if (response.code === 0) {
        setCurrentMusicData(response.message);
        setPlayModalVisible(true);
      } else {
        message.error('音乐播放失败：' + response.message);
      }
    } catch (error) {
      message.error('音乐播放失败：' + error.message);
    }
  };


  const handleClosePlayModal = () => {
    setSelectedMusicId(null);
    setCurrentMusicData(null);
    setPlayModalVisible(false); // 关闭播放音乐模态框
  };
  

  return (
    <div>
      <List
        dataSource={userMusicList}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button icon={<PlayCircleOutlined />} onClick={() => handlePlayMusic(item.id)}>
                播放
              </Button>,
            ]}
          >
            <List.Item.Meta title={item.file_path} />
          </List.Item>
        )}
      />
      <Modal
        title="播放音乐"
        visible={playModalVisible}
        onCancel={handleClosePlayModal}
        footer={[
          <Button key="cancel" onClick={handleClosePlayModal}>
            关闭
          </Button>,
        ]}
      >
        {currentMusicData && (
          <audio controls autoPlay>
            <source src={`data:audio/mp3;base64,${currentMusicData}`} />
            您的浏览器不支持 audio 元素。
          </audio>
        )}
      </Modal>
    </div>
  );
};

export default UserMusicList;

  
  