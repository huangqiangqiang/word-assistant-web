import * as React from 'react';
import './index.less';
import Modal from '../../utils/QWModal';
import { Button, Divider } from 'antd';
var showdown  = require('showdown');

const converter = new showdown.Converter();

const classPrefix = 'Detail';

class Details extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  handleCancel = () => {
    this.props.onClose && this.props.onClose();
  }

  render() {
    const { visible, word } = this.props;
    if (!visible) {
      return null;
    }
    return (
      <div className={classPrefix}>
        <Modal
          className={`${classPrefix}-modal`}
          visible={visible}
        >
          <div className={`${classPrefix}-QWModal-header`}>
            {word ? word.text : 'null'}
          </div>
          <div className={`${classPrefix}-QWModal-content`} dangerouslySetInnerHTML={{__html: converter.makeHtml(word.expand.detail)}}>
          </div>
          <Divider></Divider>
          <div className={`${classPrefix}-QWModal-footer`}>
            <Button className={`${classPrefix}-QWModal-button`} onClick={this.handleCancel}>关闭</Button>
          </div>
        </Modal>
      </div>
    );
  }
}


export default Details;