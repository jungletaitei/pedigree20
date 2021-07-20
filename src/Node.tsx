import { Group } from '@visx/group';
import Icon from "./svgIcons";
import "./App.scss";

var width = 220;
var height = 60;

var centerX = -width / 2;
var centerY = -height / 2;

const sexTextMap: any = {
    "male": "SIRE",
    "female": "DAM",
    "neutral": "HORSE"
};

/** Handles rendering Root, and all other Nodes. */
export default function Node({ key, index, node, clickHandler }: { key: any, index: number, node: any, clickHandler: any }) {
    const i = index
    const isRoot = node.depth === 0;
    var sex: string = "neutral";
    var isEmpty: boolean = node.data.name ? false : true;

    function isEven(n: number) {
        return n % 2 == 0;
    }

    // sex can only be neutral on P
    // set P sex
    if (isRoot && isEmpty) {
        sex = "neutral"
    } else if (isRoot && node.data.sex) {
        sex = node.data.sex
    }

    // i here refers to the node's position on the screen
    // mostly for assigning sex to new parents
    if (!isRoot) {
        if (isEven(i)) {
            sex = "female"
        } else {
            sex = "male"
        }
    }

    const genDepth = node.depth

    var nodeVariant: string = (genDepth > 2) ? (genDepth > 3 ? "size3" : "size2") : "size1"


    var nodeSizes: { [id: string]: { width: number, height: number } } = {}

    nodeSizes["size1"] = { width: 200, height: 50 }
    nodeSizes["size2"] = { width: 150, height: 40 }
    nodeSizes["size3"] = { width: 140, height: 20 }

    var width = nodeSizes[nodeVariant].width
    var height = nodeSizes[nodeVariant].height

    var centerX = -width / 2;
    var centerY = -height / 2;

    var fontSize = "13"
    var smallNodeFontSize = "11"

    return (
        <>
            {nodeVariant === "size1" ? (
                <Group
                    key={key}
                    id={isRoot ? 'source-node' : ''}
                    className={isEmpty ? "empty-node" : "node"}
                    top={node.x} left={node.y}
                    onClick={clickHandler}
                    onContextMenu={clickHandler}
                >
                    <rect
                        height={height}
                        width={width}
                        y={centerY}
                        x={centerX}
                        rx="15"
                    />
                    <Group top={centerY} left={centerX}>
                        <text
                            strokeWidth="2"
                            fontSize={fontSize}
                            dy={fontSize}
                            x={45}
                            y={!node.data.country ? 18 : 10}
                        >
                            {isEmpty ? "+ ADD NEW " + sexTextMap[sex] : node.data.name}
                        </text>
                        <text
                            strokeWidth="2"
                            fontSize={fontSize}
                            dy={fontSize}
                            x={45}
                            y={24}
                        >
                            {node.data.country && "(" + node.data.country + ")"}
                        </text>
                        <Icon
                            top={-18}
                            left={10}
                            //@ts-ignore
                            gender={isEmpty ? "neutral" : (sex && sex)}
                        />
                    </Group>

                </Group>
            ) : (
                < Group
                    key={key}
                    id={isRoot ? 'source-node' : ''}
                    className={isEmpty ? "empty-node" : "node"}
                    top={node.x}
                    left={node.y}
                    onClick={clickHandler}
                    onContextMenu={clickHandler}
                >
                    <rect
                        height={height}
                        width={width}
                        y={centerY}
                        x={centerX}
                        rx={nodeVariant === "size2" ? "16" : "10"}
                    />
                    <Group top={centerY} left={centerX}>
                        <text
                            strokeWidth="2"
                            fontSize={smallNodeFontSize}
                            dy={smallNodeFontSize}
                            x={15}
                            y={nodeVariant === "size2" ? 13 : 3}
                        >
                            {isEmpty ? "+ " + sexTextMap[sex] : (node.data.country ? (node.data.name + " (" + node.data.country + ")") : node.data.name)}
                        </text>
                    </Group>

                </Group>
            )
            }
        </>
    );
        }