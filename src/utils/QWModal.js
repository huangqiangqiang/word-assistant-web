import React, {Component} from 'react';
import './QWModal.less';

const classPrefix = 'QWModal';

class QWModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            modalContainerW: this.props.width || 350,
            modalContainerH: this.props.height || 360,
        };
    }

    render() {
        let offsetTop = (window.innerHeight - this.state.modalContainerH / 2) / 9;
        let offsetLeft = (window.innerWidth * 0.1) / 2;
        return (
            <div className={this.props.className} style={{display: this.props.visible ? "block" : "none"}}>
                <div className={`${classPrefix}-content`} style={{
                    top: offsetTop,
                    left: offsetLeft,
                    width: '90%',
                }}>
                    {
                        this.props.children
                    }
                </div>
                {/* 遮罩层 */}
                <div className={`${classPrefix}-cover`} style={{
                    top: 0,
                    margin: '0 auto',
                    width: window.innerWidth,
                    height: window.innerHeight
                }}/>
            </div>
        );
    }
}

export default QWModal;