import React, { Component } from 'react';
import Modal from './Modal';
import { getMods, getNominators } from '../helpers/RestApi';
import Status from './Status';

class BeatmapCard extends Component {
    state = {
        approved: this.props.approved,
        deleted: this.props.deleted,
        modal: false,
        mods: [],
        nominators: [],
        nominated: true,
        voted: true
    }

    async componentDidMount() {
        $('[data-toggle="tooltip"]').tooltip({
            trigger: 'hover'
        });

        const mods = await getMods(this.state.id);
        const nominators = await getNominators(this.state.id);
        const nominated = Boolean(nominators.find(x => x.user.id === this.props.currentUser.id));
        const voted = Boolean(mods.find(x => x.user.id === this.props.currentUser.id));

        this.setState({
            mods: mods,
            nominators: nominators,
            nominated: nominated,
            voted: voted
        });
    }

    approveBeatmap = () => {
        const { id } = this.props;
        axios.post('beatmap-approve', { beatmap_id: id });

        this.setState({
            approved: true
        });
    }

    becomeModder = (a) => {
        const { id } = this.props;

        axios.post('beatmaps/add-modder', { beatmap_id: id, type: a })
            .then(response => {
                if(response.data === 'error') {
                    return 0;
                }
                if(response.data[0].type === 0) {
                    this.setState(prevState => ({
                        mods: prevState.mods.concat(response.data),
                        voted: true
                    }));
                } else {
                    this.setState(prevState => ({
                        nominators: prevState.nominators.concat(response.data),
                        nominated: true
                    }))
                }
            });
    }

    openModal = () => {
        this.setState({
            modal: true
        });
    }

    closeModal = () => {
        this.setState({
            modal: false
        });
    }

    deleteBeatmap = () => {
        const { id } = this.props;
        axios.post('beatmap-delete', { beatmap_id: id });

        this.setState({
            deleted: true
        });
    }

    restoreBeatmap = () => {
        const { id } = this.props;
        axios.post('beatmap-restore', { beatmap_id: id });

        this.setState({
            deleted: false,
            approved: true
        });
    }

    modal = () => {
        const { beatmap_id, creator, currentUser, metadata } = this.props;
        const { mods, nominators, nominated, voted } = this.state;
        console.log(nominated);
        return (
            <Modal
                onClose={this.closeModal}
                bgImg={`https://assets.ppy.sh/beatmaps/${beatmap_id}/covers/cover.jpg`}
                title={metadata}
                desc={`mapped by ${creator}`}>

                <div>
                    <span class="text-lightblue">Modders</span> ({mods.length}):
                    {mods.map((mod, index) => {
                        return <span key={index}> {mod.user.username},</span>
                    })}
                </div>

                <div>
                    <span class="text-pink">Potential nominators</span> ({nominators.length}):
                    {nominators.map((nominator, index) => {
                        return <span key={index}> {nominator.user.username},</span>
                    })}
                </div>

                <br />

                {(currentUser.isModder && !voted) &&
                    <div>
                        <button class="button bg-green" onClick={ () => this.becomeModder(0) }>
                            <i class="fa fa-plus"></i> Mark yourself as a modder
                        </button>
                        <br /> <br />
                    </div>
                }

                {(currentUser.isModder && voted) &&
                    <div>
                        <button class="button bg-orange">
                            <i class="fa fa-minus"></i> Remove yourself from modders
                        </button>
                        <br /> <br />
                    </div>
                }

                {(currentUser.isNominator && !nominated) && <button class="button bg-pink" onClick={ () => this.becomeModder(1) }><i class="fa fa-plus"></i> Mark yourself as a potential nominator</button>}
                {(currentUser.isNominator && nominated) && <button class="button bg-orange"><i class="fa fa-minus"></i> Remove yourself from potential nominators</button>}
                {!currentUser.id &&
                    <div className="text-center">
                        <Status status="error" message="You have to be logged in to perform actions!" />
                    </div>
                }
            </Modal>
        );
    }

    render() {
        const { currentUser, creator, beatmap_id, metadata } = this.props;
        const { approved, deleted } = this.state;
        return (
            <React.Fragment>
                {this.state.modal && this.modal()}

                <div
                class="beatmap-card text-left"
                style={{
                    backgroundImage: `url(https://assets.ppy.sh/beatmaps/${beatmap_id}/covers/cover.jpg)`
                }}
                >
                    <div class="beatmap-badge round-text">
                        {metadata} <br />
                        <small>mapped by {creator}</small>
                    </div> <br />
                    <div>
                        <div class="float-left">
                            <button
                                onClick={this.openModal}
                                class="button-circle bg-primary"
                                data-placement="right"
                                data-toggle="tooltip"
                                title="Details">
                                <i class="fa fa-navicon"></i>
                            </button>
                        </div>
                        <div class="float-right">
                            {(deleted == false && (currentUser.isAmbassador && approved == false)) &&
                                <button
                                    onClick={this.approveBeatmap}
                                    class="button-circle bg-success"
                                    data-toggle="tooltip"
                                    title="Approve">
                                    <i class="fa fa-check"></i>
                                </button>}
                            {(currentUser.isAmbassador && deleted == false) &&
                                <button
                                    onClick={this.deleteBeatmap}
                                    class="button-circle bg-red"
                                    data-toggle="tooltip"
                                    title="Delete">
                                    <i class="fa fa-trash"></i>
                                </button>}
                            {(currentUser.isAmbassador && deleted == true) &&
                                <button
                                    onClick={this.restoreBeatmap}
                                    class="button-circle bg-warning"
                                    data-toggle="tooltip"
                                    title="Restore">
                                    <i class="fa fa-refresh"></i>
                                </button>}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    };
}

export default BeatmapCard;