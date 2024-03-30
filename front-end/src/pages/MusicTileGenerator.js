import React, { useState } from 'react';
import { Card, Spin, Image, Button, message, InputNumber, Input } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import HttpUtil from '../Utils/HttpUtil'; // 导入 HttpUtil

const MusicTileGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [musicData, setMusicData] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [alpha, setAlpha] = useState(0.75);
  const [numInferenceSteps, setNumInferenceSteps] = useState(50);
  const [startPrompt, setStartPrompt] = useState('church bells on sunday');
  const [endPrompt, setEndPrompt] = useState('jazz with piano');

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await HttpUtil.post('http://192.168.110.165:3013/run_inference', {
        alpha: alpha,
        num_inference_steps: numInferenceSteps,
        seed_image_id: 'og_beat',
        start: { prompt: startPrompt, seed: 42, denoising: 0.75, guidance: 7 },
        end: { prompt: endPrompt, seed: 123, denoising: 0.75, guidance: 7 }
      });
   
      setMusicData(response.audio);
      setImageData(response.image);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      message.error('数据获取失败：' + error.message);
    }
  };

  return (
    <Card
      title="音乐生成并显示平铺图"
      bordered={false}
      extra={
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={fetchData}
          loading={loading}
        >
          重新生成
        </Button>
      }
    >
      <div style={{ marginBottom: '16px' }}>
        <span>Alpha：</span>
        <InputNumber
          min={0}
          max={1}
          step={0.01}
          defaultValue={0.75}
          onChange={value => setAlpha(value)}
        />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <span>迭代步数：</span>
        <InputNumber
          min={1}
          defaultValue={50}
          onChange={value => setNumInferenceSteps(value)}
        />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <span>起始提示：</span>
        <Input
          defaultValue="church bells on sunday"
          onChange={e => setStartPrompt(e.target.value)}
        />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <span>结束提示：</span>
        <Input
          defaultValue="jazz with piano"
          onChange={e => setEndPrompt(e.target.value)}
        />
      </div>
      {loading ? (
        <Spin size="large" />
      ) : (
        <>
          <Image src={imageData} />
          <audio controls>
            <source src={musicData} type="audio/mpeg" />
            您的浏览器不支持 audio 元素。
          </audio>
        </>
      )}
    </Card>
  );
};

export default MusicTileGenerator;
