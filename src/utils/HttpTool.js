import axios from './AxiosManager';

class HttpTool {

  static token = localStorage.getItem('token');

  static setToken = (token) => {
    HttpTool.token = token;
    localStorage.setItem('token', token);
  }

  static login = (params, success, failure) => {
    axios.post('login',params)
    .then((res)=>{
      if (res.data.status === 1) {
        HttpTool.setToken(res.data.data.token);
      }
      success && success(res);
    })
    .catch((e)=>{
      failure && failure(e);
    });
  }

  static translate = (textArr, success, failure) => {
    axios.post('translate',{
      q: textArr,
      source: 'en',
      target: 'zh',
    },{
      headers:{
        Authorization: `Bearer ${HttpTool.token}`
      }
    })
    .then((res)=>{
      success && success(res);
    })
    .catch((e)=>{
      failure && failure(e);
    });
  }

  /**
   * 获取历史查询的单词
   */
  static historyWords = (page, success, failure) => {
    // 先从缓存中取
    if (page === 0) {
      const data = localStorage.getItem('QWPageZero');
      if (data) {
        success && success(JSON.parse(data));
      }
    }
    // 没有缓存，从服务端获取
    axios.get(`history?page=${page}`,{
      headers:{
        Authorization: `Bearer ${HttpTool.token}`
      }
    })
    .then((res)=>{
      // 只缓存第0页
      if (page === 0) {
        localStorage.setItem('QWPageZero', JSON.stringify(res.data));
      }
      success && success(res.data);
    })
    .catch((e)=>{
      failure && failure(e);
    });
  }

  /**
   * 从历史记录中删除单词
   */
  static deleteWord = (word, success, failure) => {
    axios.delete(`history?word_id=${word.word_id}`,{
      headers:{
        Authorization: `Bearer ${HttpTool.token}`
      }
    })
    .then((res)=>{
      success && success(res);
    })
    .catch((e)=>{
      failure && failure(e);
    });
  }

  static editWords = (params, success, failure) => {
    axios.put('translate', params, {
      headers:{
        Authorization: `Bearer ${HttpTool.token}`
      }
    })
    .then((res)=>{
      success && success(res);
    })
    .catch((e)=>{
      failure && failure(e);
    });
  }

  /**
   * 测试
   */
  static detectWords = (params, success, failure) => {
    axios.get(`detect?count=${params.count}`, {
      headers:{
        Authorization: `Bearer ${HttpTool.token}`
      }
    })
    .then((res)=>{
      success && success(res);
    })
    .catch((e)=>{
      failure && failure(e);
    });
  }
}

export default HttpTool;