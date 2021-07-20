import React from "react";
import { Button, DropdownButton, ButtonGroup, Modal, Form, Dropdown, Alert } from "react-bootstrap";
import "./App.scss";
import axios from "axios";

var noResults = false;

export default class Popup extends React.Component {
    state = {
        formName: "",
        formCountry: "",
        formYob: "",
        formsex: "neutral",
        searchResults: [],
        searchClicked: false,
        foundHorseId: null,
        selectedHorse: {}
    }

    constructor(props) {
        super(props)

        this.handleSubmit = this.handleSubmit.bind(this)
        this.loadHorse = this.loadHorse.bind(this)
        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.loadHorseTree = this.loadHorseTree.bind(this)
    }

    // on load set state variables to incoming clicked node data
    componentDidMount() {
        this.setState({
            formName: this.props.formData.name,
            formCountry: this.props.formData.country,
            formYob: this.props.formData.yob,
            formsex: this.props.formData.sex
        })
    }

    loadHorse() {
        this.setState({ searchClicked: true })

        axios.post("http://localhost:3001/api/search_horse", {
            name: this.state.formName
        }).then((res) => {
            console.log(res)
            this.setState({ searchResults: res.data })
        }, (err) => {
            console.log(err);
        })
    }

    loadHorseTree() {
        axios.post("http://localhost:3001/api/get_horse_family", {
            id: this.state.selectedHorse.id
        }).then((res) => {
            console.log("Retrieved tree: ", res)
            this.props.updateTree(res.data)
        }, (err) => {
            console.log(err);
        })
    }

    handleSubmit(submitType) {
        var newData;
        this.setState({ selectedHorse: {} })

        this.props.closePopup()

        if (submitType === "change-horse") {

            // if user selects a horse from db search results
            if (this.state.selectedHorse.name) {
                this.loadHorseTree()
            } else {
                // make a new horse
                console.log("Making new horse")

                newData = {
                    "name": this.state.formName,
                    "country": null,
                    "yob": "",
                    "sex": "neutral"
                }
                this.props.onSubmit(newData)
            }
        } else if (submitType === "edit-horse") {
            newData = {
                "name": this.state.formName,
                "country": this.state.formCountry ? this.state.formCountry : null,
                "yob": this.state.formYob ? this.state.formYob : "",
                "sex": this.state.formsex ? this.state.formsex : "neutral"
            }

            // edit existing data in local horses array
            this.props.onSubmit(newData)
        }
    }

    handleKeyPress(e) {
        if (e.key === "Enter") {
            e.preventDefault()
            this.loadHorse()
        }
    }

    render() {

        var isEditHorse, isChangeHorse = false;

        if (this.props.popupType == "change") {
            isChangeHorse = true
        } else {
            isEditHorse = true
        }

        return (
            <Modal show={true} onHide={this.props.closePopup}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isChangeHorse ? "Change Horse" : "Edit Horse"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {isChangeHorse &&
                        <Form id="change-horse-form">
                            <Form.Group className="d-flex" controlId="formSearch">
                                <Form.Control
                                    type="text"
                                    placeholder="Enter horse name"
                                    onChange={(e) => { this.setState({ formName: e.target.value }) }}
                                    onKeyPress={this.handleKeyPress}
                                    value={this.state.formName}
                                />
                                <Button
                                    id="search-button"
                                    onClick={this.loadHorse}
                                >Search</Button>
                            </Form.Group>

                            {this.state.searchClicked &&

                                // if there are search results
                                (this.state.searchResults[0] ?

                                    <div>
                                        <Form.Group controlId="exampleForm.ControlSelect2">
                                            <Form.Label>Search results for </Form.Label>
                                            <Form.Control as="select" multiple>
                                                {
                                                    this.state.searchResults.map((horse, index) => (
                                                        <option onClick={(e) => { this.setState({ selectedHorse: this.state.searchResults[index] }) }} key={horse.id} value={horse.id}>
                                                            {horse.name}, {horse.country}
                                                        </option>
                                                    ))
                                                }
                                            </Form.Control>
                                        </Form.Group>
                                    </div>
                                    :
                                    <>
                                        <h4>No results found for {this.state.formName && this.state.formName.toUpperCase()}</h4>
                                    </>
                                )
                            }

                            {this.state.searchClicked && <Alert className="mt-5" variant="secondary">
                                To create a new horse, click the SELECT button
                            </Alert>}

                        </Form>
                    }
                    {isEditHorse &&
                        <Form>
                            <Form.Group controlId="formName">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    onChange={(e) => { this.setState({ formName: e.target.value }) }}
                                    value={this.state.formName}
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>
                                    Country
                                </Form.Label>
                                <ButtonGroup onClick={(e) => { this.setState({ formCountry: e.target.value }) }}>
                                    <Button value="US">US</Button>
                                    <Button value="AUS">AUS</Button>
                                    <Button value="IR">IR</Button>
                                    <Button value="GB">GB</Button>
                                    <Button value="FR">FR</Button>
                                    <Button value="NZ">NZ</Button>

                                    <DropdownButton as={ButtonGroup} title="Other" id="bg-nested-dropdown">
                                        <Dropdown.Item value="CHI" eventKey="1">CHI</Dropdown.Item>
                                        <Dropdown.Item value="KOR" eventKey="2">KOR</Dropdown.Item>
                                    </DropdownButton>
                                </ButtonGroup>
                            </Form.Group>

                            <Form.Group controlId="formYob">
                                <Form.Label>Year of birth</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="yyyy"
                                    onChange={(e) => { this.setState({ formYob: e.target.value }) }}
                                    value={this.state.formYob}
                                />
                            </Form.Group>

                            <Form.Group controlId="formsex">
                                <Form.Label>Sex</Form.Label>
                                <div className="sex-buttons" onClick={(e) => { this.setState({ formsex: e.target.value }) }}>
                                    <Button value="male">Male</Button>
                                    <Button value="female">Female</Button>
                                    <Button value="gelding">Gelding</Button>
                                </div>
                            </Form.Group>

                        </Form>
                    }
                </Modal.Body>
                <Modal.Footer>
                    {isChangeHorse &&
                        <Button id="submit" value="change-horse" onClick={(e) => this.handleSubmit(e.target.value)}>
                            Select
                        </Button>}
                    {isEditHorse &&
                        <Button id="submit" value="edit-horse" onClick={(e) => this.handleSubmit(e.target.value)}>
                            Save
                        </Button>}

                </Modal.Footer>
            </Modal>
        )
    }
}