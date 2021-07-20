import React, { useState } from 'react';
import { Group } from '@visx/group';
import { Tree, hierarchy } from '@visx/hierarchy';
import * as d3 from "d3-hierarchy";
import { LinkHorizontalStep } from '@visx/shape';
import Popup from "./Popup";
import Node from "./Node";
import ContextMenu from './ContextMenu';
import { Button } from "react-bootstrap";
import axios from "axios";
//@ts-ignore
import GetHierarchy from './GetHierarchy';
import { v4 as uuidv4 } from "uuid";

// local attributes for each horse in UI
export const initLocalHorse = {
  id: "",
  name: "",
  country: "",
  yob: "",
  sex: "",
  sire_id: "",
  dam_id: ""
}

class flatHorse {
  id: any;
  name: string;
  country: string;
  yob: any;
  sex: string;
  sire_id: any;
  dam_id: any;

  constructor(id: any, horseObj: any) {
    this.id = id
    this.name = horseObj.name
    this.country = horseObj.country
    this.yob = horseObj.yob
    this.sex = horseObj.sex
    this.sire_id = horseObj.sire_id
    this.dam_id = horseObj.dam_id
  }

  set sire(node: any) {
    this.sire_id = node.id;
  }

  set dam(node: any) {
    this.dam_id = node.id;
  }
}

export interface FormData {
  id: any;
  name: string;
  country: string;
  yob: any;
  sex: string;
  sire_id: any;
  dam_id: any;
}

var isStartScreen: boolean = true;

// start with just 2 generations (3 horses)
var initLocalHorses: any[] = [];

currentGen = 2;
let sum = ((2 ** currentGen) - 1);  // so currentGen is 2, add 3 horses.

for (let i = 0; i < sum; i++) {
  initLocalHorses.push(new flatHorse(uuidv4(), initLocalHorse))
}

console.log(initLocalHorses)

initLocalHorses[0].sire = initLocalHorses[1]
initLocalHorses[0].dam = initLocalHorses[2]

console.log(initLocalHorses)

const blankTree = GetHierarchy({ treeArray: initLocalHorses })
const initSearchResults: any[] = [];

var clickedIndex: number;
var currentGen: number;

/* Typescript type declarations. Modulize later after doing a few more tutorials */

interface AppProps {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
};

interface AppState {
  showPopup: boolean,
  localHorses: any[],
  searchResults: any[],
  formData: FormData,
  coords: any,
  popupType: string,
  showContextMenu: boolean,
  username: any,
  pushLeft: boolean,
  isRoot: boolean // to configure popup shown items
}

/** End of Typescript stuff */

export default class App extends React.Component<AppProps, AppState> {
  state = {
    showPopup: false, // don't show at the start
    localHorses: initLocalHorses,
    searchResults: initSearchResults,
    formData: initLocalHorse,
    coords: { x: 0, y: 0 },
    showContextMenu: false,
    isRoot: false,
    popupType: "",
    pushLeft: true,
    username: ""
  }

  constructor(props: AppProps) {
    super(props)

    this.loadNodeData = this.loadNodeData.bind(this);
    this.closePopup = this.closePopup.bind(this);
    this.routeContextMenu = this.routeContextMenu.bind(this);
    this.updateFormData = this.updateFormData.bind(this);
    this.updateTree = this.updateTree.bind(this);
    this.pushDbChanges = this.pushDbChanges.bind(this);
    this.addGeneration = this.addGeneration.bind(this);
  }

  // on click "Submit to Database"
  pushDbChanges() {
    let pushArray = []  // only push non-empty horses from fixed-size localHorses

    let localHorses = this.state.localHorses  // make snapshot of localHorses at time of submit

    for (let i in localHorses) {
      if (localHorses[i].name) {
        pushArray.push(localHorses[i])
      }
    }

    // TODO: change this alert to be more user-friendly/readable by a normal person lol
    alert("Pushing the following array to the DB...")
    console.log(pushArray)

    // push new horses in reverse so that we add the parents first so we can reference them in mom/dad_id
    pushArray.slice().reverse()
      .forEach(function (horse) {
        /*
        axios.post("http://localhost:3001/api/push_changes", {
          id: horse.id,
          name: horse.name,
          country: horse.country,
          mom_id: horse.mom_id,
          dad_id: horse.dad_id,
          isNew: horse.isNew
        }).then((res) => {
          console.log(res)
        }, (err) => {
          console.log(err);
        })
        */
      })
  }

  // 
  updateTree(flatDbArray: any, newHorseName?: string) {
    /* Runs if the "Select" button in Popup has been clicked.
      If horse is found, set loaded tree as localHorses and send to update tree
      If no horse selected, make new tree (reset tree) and set P name as searched name
    */

    if (flatDbArray) {
      console.log("Formatting selected horse tree...")

      let newLocal: any = []

      // TODO add check if flatDbArray is oftype flatHorse


      // always want at least 2 generations showing
      if (flatDbArray.length < 2) {
        currentGen = 2;
        flatDbArray.push(new flatHorse(uuidv4(), initLocalHorse))
        flatDbArray.push(new flatHorse(uuidv4(), initLocalHorse))

        flatDbArray[0].sire = flatDbArray[1]
        flatDbArray[0].dam = flatDbArray[2]
      }

      this.setState({
        localHorses: flatDbArray
      })

    } else {
      // if no horse selected, reset localHorses and tree and create a new P
      console.log("Creating new P horse...")

      // Reset tree and localhorses
      this.setState({
        localHorses: initLocalHorses
      })

      // go thru process of changing just one entry of localHorses
      // Create new P
      let localHorseClone = this.state.localHorses
      localHorseClone[0].name = newHorseName
      localHorseClone[0] = new flatHorse(uuidv4(), localHorseClone[0])  // generate new id for new horse

      this.setState({
        localHorses: localHorseClone
      })
    }
  }

  updateFormData(newData: FormData) {
    // helper function to be called by Popup component to update form data based on popup input
    const i = clickedIndex;

    let localHorseClone = this.state.localHorses

    for (var keyProp in newData) {
      //@ts-ignore
      localHorseClone[i][keyProp] = newData[keyProp]
    }

    this.setState({
      localHorses: localHorseClone
    })

    console.log(clickedIndex)

    // check if we need to add a new generation
    if (!this.state.localHorses[clickedIndex].dam_id) {
      console.log("Adding new generation...")
      console.log(this.state.localHorses)
      console.log("Localhorses ^")
      this.addGeneration()
    }

    this.closePopup()
  }

  loadNodeData() {
    // load data from clicked node
    const i = clickedIndex;

    var formDataFromClicked: FormData
    formDataFromClicked = { ...this.state.localHorses[i] }

    this.setState({
      formData: formDataFromClicked
    })
  }

  setClickedIndex(id: string) {
    this.state.localHorses.forEach(horse => {
      if (horse.id === id) {
        clickedIndex = this.state.localHorses.indexOf(horse)
      }
    })
  }

  handleClick({ e, i, node }: { e: any, i: number, node: any }) {
    /* 
      1. Update clickedIndex
      2. Copy data from clicked node into formData
      3. Display popup or context menu
    */

    // TODO improve this
    isStartScreen = false;

    this.setClickedIndex(node.id)
    this.loadNodeData()

    if (e.type === "click") {
      this.setState({
        showPopup: true,
        popupType: "change"
      })

    } else if (e.type === "contextmenu") {
      e.preventDefault();

      this.setState({
        showContextMenu: true,
        coords: { x: node.x - 10, y: node.y }
      })
    }
  }

  addGeneration() {
    /* EDIT THIS! TODO If an empty node is clicked on:
      1. Check currentGen against # horses in localHorses
      2. If aren't enough horses
      3. If there aren't enough horses, add X horses to localHorses
    */

    // need to be able to update previous generation sire/dam so make a clone
    var localHorsesClone = this.state.localHorses

    const prevGen = currentGen
    currentGen += 1;

    /*
    let addNHorses = 2 ** (currentGen - 1);
    let newHorses = [];

    for (let i = 0; i < addNHorses; i++) {
      newHorses.push(new flatHorse(uuidv4(), initLocalHorse));
    }

    console.log(newHorses);

    // build relationships with previous generation
    // the following formula only works b/c currentGen is guaranteed to be > 1
    const prevGenStart = (2 ** (prevGen - 1)) - 1
    const prevGenEnd = (2 ** prevGen) - 2
    var cycleNewHorses = 0
    for (let i = prevGenStart; i <= prevGenEnd; i++) {
      localHorsesClone[i].sire = newHorses[cycleNewHorses]
      cycleNewHorses += 1
      localHorsesClone[i].dam = newHorses[cycleNewHorses]
      cycleNewHorses += 1
    }
    */

    // only add parents for the clickedHorse

    let addNHorses = 2
    let newHorses = []

    for (let i = 0; i < addNHorses; i++) {
      newHorses.push(new flatHorse(uuidv4(), initLocalHorse));
    }

    localHorsesClone[clickedIndex].sire = newHorses[0]
    localHorsesClone[clickedIndex].dam = newHorses[1]



    Array.prototype.push.apply(localHorsesClone, newHorses)

    this.setState({
      localHorses: localHorsesClone
    })

    console.log("result")
    console.log(localHorsesClone)

  }

  routeContextMenu({ clickedOption }: { clickedOption: string }) {

    this.closePopup() // close contextMenu

    // context menu options are modify, remove or delete
    if (clickedOption == "modify") {

      this.setState({
        popupType: "edit",
        showPopup: true
      })
    } else if (clickedOption == "remove") {
      // change the parentage so that the clicked horse is no longer one of the parents of P

      const removeId = this.state.localHorses[clickedIndex].id
      const updatedLocalHorses = GetHierarchy({
        instruction: { name: "remove", id: removeId },
        treeArray: this.state.localHorses
      })

      this.setState({
        //@ts-ignore
        localHorses: updatedLocalHorses
      })

    } else if (clickedOption == "delete") {
      // database action
      let horseToDelete = this.state.localHorses[clickedIndex]
      console.log("deleting" + horseToDelete.name)
      /*
      axios.post("http://localhost:3001/api/delete_horse", {
        id: horseToDelete.id,
      }).then((res) => {
        console.log(res)
      }, (err) => {
        console.log(err);
      })
      */
    }

  }

  closePopup() {
    this.setState({
      showPopup: false,
      showContextMenu: false,
      pushLeft: false
    })
  }

  componentDidMount() {
    fetch('/api/getUsername')
      .then(res => res.json())
      .then(user => this.setState({ username: user.username }));
  }

  render() {
    const { username } = this.state;

    const callHierarchy : any = GetHierarchy({ treeArray: this.state.localHorses })
    const data: d3.HierarchyNode<any> = callHierarchy

    const { height, width, margin } = this.props;
    const rightMargin = this.state.pushLeft ? (width / 2) : margin.right;
    const yMax = height - margin.top - margin.bottom;
    const xMax = width - margin.left - rightMargin;


    return (
      <>
      <svg width={width} height={height}>
          <rect id="tree-container-rect" rx="14" width={width} height={height}
            onClick={this.closePopup}
          />
          <Tree<any> root={data} size={[yMax, xMax]} separation={(a, b) => { return (a.parent == b.parent ? 1 : 1) / a.depth; }}>
            {tree => (
              <Group top={margin.top} left={margin.left}>
                {tree.links().map((link, key) => (
                  <LinkHorizontalStep
                    className="link-lines"
                    key={`link-${key}`}
                    data={link}
                  />
                ))}
                {tree.descendants().map((node, i) => (
                  <>
                    <Node
                      key={node.id}
                      index={i}
                      node={node}
                      clickHandler={(e : any) => { return this.handleClick({ e, node, i }); }}
                    />
                  </>
                ))}
                {this.state.showContextMenu &&
                  <ContextMenu
                    coords={this.state.coords}
                    clickHandler={this.routeContextMenu}
                  />
                }
              </Group>
            )}
          </Tree>
          
        </svg>
        {this.state.showPopup &&
          //@ts-ignore
          <Popup
            //@ts-ignore
            formData={this.state.formData}
            onSubmit={this.updateFormData}
            closePopup={this.closePopup}
            updateTree={this.updateTree}  // for change horse
            isRoot={this.state.isRoot}
            popupType={this.state.popupType}
          />
        }
        <div id="bottom-button" onClick={this.pushDbChanges}>
          <Button>Save</Button>
        </div>

      </>
    );
  }
}
