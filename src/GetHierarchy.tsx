// handles all tree mutations
import { v4 as uuidv4 } from "uuid";
import * as d3 from "d3";
import { useState, useEffect } from "react";

export interface FormData {
    id: any;
    name: string;
    country: string;
    yob: any;
    sex: string;
    sire_id: any;
    dam_id: any;
}

const emptyhorse = {
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

    get sireId() {
        return this.sire_id
    }

    get damId() {
        return this.dam_id
    }

    set sire(node: any) {
        this.sire_id = node.id;
    }

    set dam(node: any) {
        this.dam_id = node.id;
    }
}

function restructureForStratify(array: any) {
    // root has no parent
    array[0].parentId = null

    for (let i = 0; i <= (array.length - 2); i++) {
        for (let ii = (i + 1); ii <= (array.length - 1); ii++) {

            if ((array[i].sire_id === array[ii].id) || (array[i].dam_id === array[ii].id)) {
                array[ii].parentId = array[i].id
            }
        }
    }

    return array
}

function removeNode(array: any[], removeId: string) {
    /* Takes in array and id of child to remove and goes through P children until
    it finds the child, then replace with a new blank horse. 
    */

    var hierToEdit = arrayToHierarchy(array)

    const selectChild: any = hierToEdit.descendants().find(d => d.id === removeId)
    const selectParent = selectChild.parent

    // parent->child structure!
    // TODO merge this if and else if
    if (selectParent.children[0].id == removeId) {
        selectParent.children[0].data = new flatHorse(uuidv4(), emptyhorse)
        selectParent.children[0].children = []  // reset all grandhorses as well for the removed horse
        // update embedded flatHorse class object data as well
        selectParent.data.sire_id = selectParent.children[0].id
        selectParent.children[0].data.id = selectParent.children[0].id
    } else if (selectParent.children[1].id == removeId) {
        selectParent.children[1].data = new flatHorse(uuidv4(), emptyhorse)
        selectParent.children[1].children = []  // reset all grandhorses as well for the removed horse
        // update embedded flatHorse class object data as well
        selectParent.data.dam_id = selectParent.children[1].id
        selectParent.children[1].data.id = selectParent.children[1].id
    }

    var returnArray: any[] = []

    hierToEdit.each(node => {
        returnArray.push(node.data)
    })

    return returnArray
}

function arrayToHierarchy(array: any[]) {
    const restructuredArray = restructureForStratify(array)
    var stratify = d3.stratify()
    return stratify(restructuredArray)
}

export default function GetHierarchy(input: { instruction?: { name: string, id: string }, treeArray: any[] }): any[] | d3.HierarchyNode<any> {
    /* Needs to be able to:
        1. Take in flat array of any size and map to hierarchy
        2. Removing a node can be done best on a hierarchical structure, so pre-process
        treeArray if instruction = "remove"
    */

    const instruction = input.instruction ? input.instruction : null
    var treeArray = input.treeArray

    var newLocalHorses: any[] = []

    if (instruction) {
        if (instruction.name === "remove") {
            console.log("Removing node " + instruction.id + " from array...")
            newLocalHorses = removeNode(treeArray, instruction.id)
            treeArray = newLocalHorses
            return newLocalHorses
        }
    }

    return arrayToHierarchy(treeArray)
}


///

/*
export  function getTreeData({ instruction, node }: { instruction: string, node: any }) {
    const firstInitHorse = new flatHorse(uuidv4(), emptyhorse)
    const [localHorses, setLocalHorses] = useState<any>(firstInitHorse)

    var currentGen = 1

    function makeBlankTree(nGen: number) {
        // add horses to tree
        var sum = 0;
        currentGen = nGen


        sum = ((2 ** nGen) - 1) - 1

        for (let i = 0; i < sum; i++) {
            setLocalHorses((prev: any) => [
                ...prev,
                new flatHorse(uuidv4(), emptyhorse)
            ])
        }
    }

    function addGen() {
        // if current generation is 3, want to add 2^3 aka 8 grandhorses and so on
        const horsesToAdd = (2 ** currentGen)

        for (let i = 0; i < sum; i++) {
            setLocalHorses((prev: any) => [
                ...prev,
                new flatHorse(uuidv4(), emptyhorse)
            ])
        }
    }

    function editTree(node: any) {
        for (let index in localHorses) {
            if (localHorses[index].id == node.id) {

            }
        }
    }

    return (
        null
    )
}

export default function getTreeData({ instruction, nodeIndex, treeToEdit }: { instruction: string, nodeIndex?: number, treeToEdit?: any }) {

    var chaos = d3.hierarchy(new Node(uuidv4(), emptyhorse));
    chaos.children?.push(emptynode)



    //@ts-ignore
    //myHier.children[0].data = new Node(uuidv4(), emptyhorse)

    console.log(chaos)


    var returnTree: any

    let minimalTree: { [name: string]: Node } = {
        "A": new Node(uuidv4(), emptyhorse)
    }

    function makeBlankTree() {
        // makes blank tree of size (3) - one P, two NP nodes
        var twoGenTree = minimalTree;

        // add two new horses
        twoGenTree["B"] = new Node(uuidv4(), emptyhorse)
        twoGenTree["C"] = new Node(uuidv4(), emptyhorse)

        return twoGenTree
    }

    function resetNode(tree: any, nodeIndex: number) {
        console.log("Removing node " + nodeIndex)

        var numberToLetter = ["A", "B", "C"]
        const letterIndex = numberToLetter[nodeIndex]

        tree[letterIndex] = emptyhorse

        return tree
    }

    // last step - sets the returned tree to the current values
    function makeRelationships(tree: any) {
        tree.A.sire = tree.B
        tree.A.dam = tree.C

        return tree
    }

    function printNodeDetails(nodeIndex: number) {
        console.log(nodeIndex)
    }

    // decide what to do based on input instructions

    if (treeToEdit) {
        returnTree = treeToEdit

        // can only perform edit functions if tree is not blank
        if (instruction === "remove") {
            nodeIndex && (returnTree = resetNode(returnTree, nodeIndex))
        }
    } else {
        returnTree = makeBlankTree()
    }


    // finalize tree by "pushing" all changes in NPs to the P node
    returnTree = makeRelationships(returnTree)

    const myHier = d3.hierarchy(returnTree.A)

    return (
        // always going to return the modified treeDict
        myHier
    )

}*/