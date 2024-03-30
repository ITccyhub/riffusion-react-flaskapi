import React, { useState, useEffect } from 'react';
import { List, Button, message, Modal, Input } from 'antd';
import { PlayCircleOutlined, CommentOutlined } from '@ant-design/icons';
import HttpUtil from '../Utils/HttpUtil'; // 导入 HttpUtil

const PublicMusicList = () => {
  const [publicMusicList, setPublicMusicList] = useState([]);
  const [playModalVisible, setPlayModalVisible] = useState(false);
  const [selectedMusicId, setSelectedMusicId] = useState(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [currentMusicData, setCurrentMusicData] = useState(null);

  useEffect(() => {
    fetchPublicMusicList();
  }, []);

  const fetchPublicMusicList = async () => {
    try {
      const response = await HttpUtil.get('/api/v1/publicMusicFiles');
      if (response.code === 0) {
        setPublicMusicList(response.public_music_files);
      } else {
        message.error('获取音乐列表失败！');
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
  

  const handleCommentMusic = (musicId) => {
    setSelectedMusicId(musicId);
    setCommentModalVisible(true);
  };

  const handleCloseCommentModal = () => {
    setSelectedMusicId(null);
    setCommentContent('');
    setCommentModalVisible(false);
  };

  const handleCommentSubmit = async () => {
    try {
      const response = await HttpUtil.post('/api/v1/commentMusic', {
        music_id: selectedMusicId,
        comment_content: commentContent,
      });
      if (response.code === 0) {
        message.success('评论成功！');
        setCommentContent('');
        setCommentModalVisible(false);
      } else {
        message.error('评论失败！');
      }
    } catch (error) {
      message.error('评论失败！');
      console.error('评论失败:', error);
    }
  };

  return (
    <div>
      <List
        dataSource={publicMusicList}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button icon={<PlayCircleOutlined />} onClick={() => handlePlayMusic(item.id)}>
              播放
            </Button>,,
              <Button icon={<CommentOutlined />} onClick={() => handleCommentMusic(item.id)}>
                评论
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
      <Modal
        title="评论音乐"
        visible={commentModalVisible}
        onCancel={handleCloseCommentModal}
        onOk={handleCommentSubmit}
      >
        <Input.TextArea
          rows={4}
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          placeholder="请输入评论内容"
        />
      </Modal>
    </div>
  );
};

export default PublicMusicList;
