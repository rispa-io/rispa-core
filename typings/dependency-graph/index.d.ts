declare module "dependency-graph" {
  export default class DepGraph<T> {
    nodes: {
      [key: string]: T,
    }

    // Node -> [Dependency Node]
    outgoingEdges: {
      [key: string]: string
    }

    // Node -> [Dependant Node]
    incomingEdges: {
      [key: string]: string
    }

    /**
     * Add a node to the dependency graph. If a node already exists, this method will do nothing.
     */
    addNode: (node: string, data?: T) => void

    /**
     * Remove a node from the dependency graph. If a node does not exist, this method will do nothing.
     */
    removeNode: (node: string) => void

    /**
     * Check if a node exists in the graph
     */
    hasNode: (node: string) => boolean

    /**
     * Get the data associated with a node name
     */
    getNodeData: (node: string) => T

    /**
     * Set the associated data for a given node name. If the node does not exist, this method will throw an error
     */
    setNodeData: (node: string, data: T) => void

    /**
     * Add a dependency between two nodes. If either of the nodes does not exist,
     * an Error will be thrown.
     */
    addDependency: (from: string, to: string) => void

    /**
     * Remove a dependency between two nodes.
     */
    removeDependency: (from: string, to: string) => void

    /**
     * Get an array containing the nodes that the specified node depends on (transitively).
     *
     * Throws an Error if the graph has a cycle, or the specified node does not exist.
     *
     * If `leavesOnly` is true, only nodes that do not depend on any other nodes will be returned
     * in the array.
     */
    dependenciesOf: (node: string, leavesOnly?: boolean) => string[]

    /**
     * get an array containing the nodes that depend on the specified node (transitively).
     *
     * Throws an Error if the graph has a cycle, or the specified node does not exist.
     *
     * If `leavesOnly` is true, only nodes that do not have any dependants will be returned in the array.
     */
    dependantsOf: (node: string, leavesOnly?: boolean) => string[]

    /**
     * Construct the overall processing order for the dependency graph.
     *
     * Throws an Error if the graph has a cycle.
     *
     * If `leavesOnly` is true, only nodes that do not depend on any other nodes will be returned.
     */
    overallOrder: (leavesOnly?: boolean) => string[]
  }
}
