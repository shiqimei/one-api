import React, { useEffect, useState } from 'react';
import { Button, Form, Header, Segment } from 'semantic-ui-react';
import { useParams } from 'react-router-dom';
import { API, showError, showSuccess, timestamp2string } from '../../helpers';

const EditToken = () => {
  const params = useParams();
  const tokenId = params.id;
  const isEdit = tokenId !== undefined;
  const [loading, setLoading] = useState(isEdit);
  const originInputs = {
    name: '',
    remain_times: -1,
    expired_time: -1
  };
  const [inputs, setInputs] = useState(originInputs);
  const { name, remain_times, expired_time } = inputs;

  const handleInputChange = (e, { name, value }) => {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  };

  const setExpiredTime = (month, day, hour, minute) => {
    let now = new Date();
    let timestamp = now.getTime() / 1000;
    let seconds = month * 30 * 24 * 60 * 60;
    seconds += day * 24 * 60 * 60;
    seconds += hour * 60 * 60;
    seconds += minute * 60;
    if (seconds !== 0) {
      timestamp += seconds;
      setInputs({ ...inputs, expired_time: timestamp2string(timestamp) });
    } else {
      setInputs({ ...inputs, expired_time: -1 });
    }
  };

  const loadToken = async () => {
    let res = await API.get(`/api/token/${tokenId}`);
    const { success, message, data } = res.data;
    if (success) {
      if (data.expired_time !== -1) {
        data.expired_time = timestamp2string(data.expired_time);
      }
      setInputs(data);
    } else {
      showError(message);
    }
    setLoading(false);
  };
  useEffect(() => {
    if (isEdit) {
      loadToken().then();
    }
  }, []);

  const submit = async () => {
    if (!isEdit && inputs.name === '') return;
    let localInputs = inputs;
    localInputs.remain_times = parseInt(localInputs.remain_times);
    if (localInputs.expired_time !== -1) {
      let time = Date.parse(localInputs.expired_time);
      if (isNaN(time)) {
        showError('过期时间格式错误！');
        return;
      }
      localInputs.expired_time = Math.ceil(time / 1000);
    }
    let res;
    if (isEdit) {
      res = await API.put(`/api/token/`, { ...localInputs, id: parseInt(tokenId) });
    } else {
      res = await API.post(`/api/token/`, localInputs);
    }
    const { success, message } = res.data;
    if (success) {
      if (isEdit) {
        showSuccess('令牌更新成功！');
      } else {
        showSuccess('令牌创建成功！');
        setInputs(originInputs);
      }
    } else {
      showError(message);
    }
  };

  return (
    <>
      <Segment loading={loading}>
        <Header as='h3'>{isEdit ? "更新令牌信息" : "创建新的令牌"}</Header>
        <Form autoComplete='off'>
          <Form.Field>
            <Form.Input
              label='名称'
              name='name'
              placeholder={'请输入名称'}
              onChange={handleInputChange}
              value={name}
              autoComplete='off'
              required={!isEdit}
            />
          </Form.Field>
          <Form.Field>
            <Form.Input
              label='剩余次数'
              name='remain_times'
              placeholder={'请输入剩余次数，-1 表示无限制'}
              onChange={handleInputChange}
              value={remain_times}
              autoComplete='off'
              type='number'
            />
          </Form.Field>
          <Form.Field>
            <Form.Input
              label='过期时间'
              name='expired_time'
              placeholder={'请输入过期时间，格式为 yyyy-MM-dd HH:mm:ss，-1 表示无限制'}
              onChange={handleInputChange}
              value={expired_time}
              autoComplete='off'
              type='datetime-local'
            />
          </Form.Field>
          <Button type={'button'} onClick={() => {
            setExpiredTime(0, 0, 0, 0);
          }}>永不过期</Button>
          <Button type={'button'} onClick={() => {
            setExpiredTime(1, 0, 0, 0);
          }}>一个月后过期</Button>
          <Button type={'button'} onClick={() => {
            setExpiredTime(0, 1, 0, 0);
          }}>一天后过期</Button>
          <Button type={'button'} onClick={() => {
            setExpiredTime(0, 0, 1, 0);
          }}>一小时后过期</Button>
          <Button type={'button'} onClick={() => {
            setExpiredTime(0, 0, 0, 1);
          }}>一分钟后过期</Button>
          <Button onClick={submit}>提交</Button>
        </Form>
      </Segment>
    </>
  );
};

export default EditToken;
