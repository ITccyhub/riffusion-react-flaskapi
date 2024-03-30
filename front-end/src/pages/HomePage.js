import React, { useState } from 'react';

import myIcon from '../images/icon.jpg';
import { Layout, Menu, Avatar } from 'antd';
import { UploadOutlined, CustomerServiceOutlined, AppstoreOutlined } from '@ant-design/icons';
import MusicUploadForm from './MusicUploadForm';
import MusicDisplay from './MusicDisplay';
import MusicTileGenerator from './MusicTileGenerator';
import UserMusicList from './UserMusicList';

const { Content, Footer, Sider } = Layout;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('1');

  const onCollapse = collapsed => {
    setCollapsed(collapsed);
  };

  let pageView;
  switch (currentPage) {
    case '2':
      pageView = <MusicDisplay />;
      break;
    case '3':
      pageView = <MusicTileGenerator />;
      break;
    case '4':
      pageView = <UserMusicList />;
      break;
    default:
      pageView = <MusicUploadForm />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={152}
        collapsible
        collapsed={collapsed}
        onCollapse={onCollapse}
      >
        <div className="logo" style={{ height: 80, backgroundColor: "#002140", textAlign: 'center' }}>
          <Avatar src={myIcon} alt='' style={{ width: 60, height: 60, marginTop: 10 }} />
        </div>

        <Menu theme="dark" mode="inline"
          defaultSelectedKeys={[currentPage]}
          onSelect={({ key }) => setCurrentPage(key)}>
          <Menu.Item key="1">
            <UploadOutlined />
            <span>音乐上传</span>
          </Menu.Item>
          <Menu.Item key="2">
            <CustomerServiceOutlined />
            <span>音乐展示</span>
          </Menu.Item>
          <Menu.Item key="3">
            <AppstoreOutlined />
            <span>音乐生成并显示平铺图</span>
          </Menu.Item>
          <Menu.Item key="4">
            <CustomerServiceOutlined />
            <span>我的音乐音乐</span>
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Content style={{ margin: '12px 12px' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
            {pageView}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Loving you forever ©2019 Created by XWH
        </Footer>
      </Layout>
    </Layout>
  );
}

export default App;
