import { treeSearchAlgorithm } from '/utils/tree-search-algorithm.js';
import { findNextServer } from '/hack/find.js';
import { TreeNode } from '/classes/tree-node.js';

const SCP_FILES = '/private-server/scp-files.js';
const SMART_HACK = '/hack/smart-hack.js';

/** @param {NS} ns **/
export async function main(ns) {
    let scpPid = await ns.run(SCP_FILES, 1);
    let scpRunning = true;
    let runningScript;
    while (scpRunning) {
        runningScript = ns.getRunningScript(scpPid);
        runningScript == null ? scpRunning = false : scpRunning = true;
        await ns.sleep(100);
    }

    let runOnHome = ns.args[0];

    let serverList = treeSearchAlgorithm(ns);

    let getHackTargets = (serverList) => {
        let player = ns.getPlayer();

        let hackTargets = []
        for (let server of serverList) {
            let so = ns.getServer(server.hostname);
            let node = new TreeNode(so.hostname);

            let serverHacklevel = so.requiredHackingSkill;
            if (serverHacklevel < player.hacking && !so.purchasedByPlayer && so.hasAdminRights) {
                hackTargets.push(node);
            }
        }
        return hackTargets;
    }

    let getPrivateServers = (serverList) => {
        let privateServers = [];
        for (let server of serverList) {
            let so = ns.getServer(server.hostname);
            if (so.purchasedByPlayer) {
                privateServers.push(so.hostname);
            }
        }
        return privateServers;
    }

    let runningTargetsArray = [];
    let privateServerArray = getPrivateServers(serverList);

    while (privateServerArray.length > 1) {
        let target = findNextServer(ns, getHackTargets(serverList), runningTargetsArray);
        let host = privateServerArray.pop();

        runningTargetsArray.push(target);

        let run = await ns.run(SMART_HACK, 1, target, host);
        ns.tprint(`PID = ${run}, started ${SMART_HACK} on ${host}. Targeting ${target}.`);
        await ns.sleep(1000);
    }
}