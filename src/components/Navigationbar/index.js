import * as React from 'react';
import './index.less';
import { withRouter } from 'react-router-dom';
import hideIcon from './assets/hide.png';
import showIcon from './assets/show.png';
import historyIcon from './assets/history.png';
import translateIcon from './assets/translate.png';
import logoutIcon from './assets/logout.png';
import testIcon from './assets/test.png';

const classPrefix = 'Navigationbar';

class Navigationbar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      position: 'bottom',
      hiddenPath: [
        '/login', // 需要隐藏的路由
      ],
      items: [
        {
          title: '去翻译',
          icon: translateIcon,
          onClick: ()=>{
            this.props.history.push('/');
          }
        },
        {
          title: '我的单词',
          icon: historyIcon,
          onClick: ()=>{
            this.props.history.push('/history');
          }
        },
        {
          title: '测验',
          icon: testIcon,
          onClick: ()=>{
            this.props.history.push('/detect');
          }
        },
        {
          title: '登出',
          icon: logoutIcon,
          onClick: ()=>{
            localStorage.removeItem('token');
            this.props.history.push('/login');
          }
        },
        {
          title: '隐藏',
          icon: hideIcon,
          onClick: ()=>{
            this.toggle();
          }
        },
      ]
    };
  }

  toggle = () => {
    if (this.state.status === 0) {
      this.setState({
        status: 1 // 显示
      });
    } else {
      this.setState({
        status: 0 // 隐藏
      });
    }
  }

  show = () => {
    this.setState({
      status: 1
    });
  }

  hide = () => {
    this.setState({
      status: 0
    });
  }

  render() {
    // 是否隐藏整个navigationbar
    let isHidden = false;
    this.state.hiddenPath.map((path)=>{
      if (path === this.props.location.pathname) {
        isHidden = true;
      }
      return null;
    });
    if (isHidden) {
      return null;
    }

    // 是否处于隐藏模式
    if (this.state.status === 0) {
      const className = `${classPrefix}-showButton`;
      return (
        <div className={className} >
          <div className={`${classPrefix}-container-item`} onClick={this.toggle}><img src={showIcon} alt='' /></div>
        </div>
      );
    } else {
      return (
        <div className={`${classPrefix} ${classPrefix}-direction-${this.state.position}`}>
          <div className={`${classPrefix}-container ${classPrefix}-container-direction-${this.state.position}`} >
          {
            this.state.items.map((item)=>{
              return (
                <div key={item.title} className={`${classPrefix}-container-item`} onClick={item.onClick}>
                  {
                    item.icon ? (
                      <img src={item.icon} alt={item.title} />
                    ) : (
                      item.title
                    )
                  }
                </div>
              );
            })
          }
          </div>
        </div>
      );
    }
  }
}

export default withRouter(Navigationbar);