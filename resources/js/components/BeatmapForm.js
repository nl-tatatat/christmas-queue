import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Status from './Status';

export default class BeatmapForm extends Component {
    state = {
        beatmapsetId: '',
        message: '',
        status: '',
    }

    beatmapParse = (url) => {
        let split;

        if(url.includes('/beatmapsets/')) {
            const a = url.split('/beatmapsets/');
            split = a[1].split('#');
            return split[0];
        } else if(url.includes('/s/')) {
            split = url.split('/s/');
            return split[1];
        } else if(url.includes('/b/')) {
            return 'wrong_link';
        }
    }

    changeHandler = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    submitHandler = async (e) => {
        e.preventDefault();
        let { beatmapsetId } = this.state;

        try {
            var parser = await this.beatmapParse(beatmapsetId);

            if(parser === 'wrong_link') {
                const status = 'error';
                const message = '/b/ links are not supported, you should use the /s/ one instead!';

                this.setState({
                    message: message,
                    status: status
                })

                return 0;
            }
        } catch (err) {
            const status = 'error';
            const message = 'Seems like the URL format is wrong...';

            this.setState({
                message: message,
                status: status
            })

            return 0;
        }

        beatmapsetId = parser;

        let message;
        let status;

        const data = {
            beatmapsetId: beatmapsetId,
        }

        const res = await axios.post('beatmaps', data);
        try {
            if(typeof(res.data.error) !== 'undefined') {
                status = 'error';
                message = res.data.error;
            } else {
                status = 'success';
                message = 'Your beatmap has been sent for approval!';
            }

            this.setState({
                beatmapsetId: '',
                message: message,
                status: status,
            });

        } catch(err) {
            status = 'error';
            message = 'Seems like something went wrong...';

            this.setState({
                beatmapsetId: '',
                message: message,
                status: status,
            });
        }
    }

    render() {
        const { beatmapsetId, message, status } = this.state;
        return (
            <div>
                <div class="form-wrapper">
                    <form onSubmit={this.submitHandler}>
                        <input
                            autoComplete="off"
                            class="input-invisible"
                            type="text"
                            name="beatmapsetId"
                            value={beatmapsetId}
                            onChange={this.changeHandler}
                        />
                        <button class="button bg-blue" type="submit"><i class="fa fa-check"></i> Request!</button>
                    </form>
                </div>
                <br />
                <small class="color-gray">please put <b>beatmapset</b> URL here</small>
                <br />
                {status && <Status
                    message={message}
                    status={status}
                />}
            </div>
        );
    }
}

if (document.getElementById('beatmap-form')) {
    ReactDOM.render(<BeatmapForm />, document.getElementById('beatmap-form'));
}
