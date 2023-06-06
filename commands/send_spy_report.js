const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function parseReport(report) {
    let parsedReport = {
        position: null,
        stationName: null,
        owner: null,
        guild: null,
        completedTime: null,
        detected: null,
        spyDefense: null,
        captureDefense: null,
        resources: null,
        labor: null,
        listOfBuildings: null,
        hiddenResources: null,
        listOfOutposts: null,
        listOfFleets: null,
        totalFleets: null,
        hangarContent: null
    };

    // Extract position
    let positionMatch = report.match(/Spy Report on hex \((.*?)\)/);
    if (positionMatch) {
        parsedReport.position = positionMatch[1];
    }

    // Extract station name
    let stationNameMatch = report.match(/Spy Report on hex \((-?\d+,\d+)\) (.*?) owned by /);
    if (stationNameMatch) {
        parsedReport.stationName = stationNameMatch[2].trim();
    }


    // Extract owner and guild
    let ownerMatch = report.match(/owned by (.*?) \[(.*?)\]/);
    if (ownerMatch) {
        if (ownerMatch[1].includes('playerProfile')) {
            ownerMatch[1] = ownerMatch[1].replace(/playerProfile\(|\)/g, '');
            ownerMatch[1] = ownerMatch[1].replace(/^\s*(.*?)\s*\1\s*$/, '$1');
        }
        parsedReport.owner = ownerMatch[1].trim();
        parsedReport.guild = ownerMatch[2].trim();
    }

    // Extract completed time
    let completedMatch = report.match(/completed (.*?) ago./);
    if (completedMatch) {
        parsedReport.completedTime = completedMatch[1];
    }

    // Check if operation remained undetected
    parsedReport.detected = report.includes('Our spying operation remained undetected.') ? 'Undected' : 'Detected';

    // Extract defense points
    let spyDefenseMatch = report.match(/against a spy defense rating of (\d+)/);
    if (spyDefenseMatch) {
        parsedReport.spyDefense = spyDefenseMatch[1].trim();
    }

    // Extract capture defense
    let captureDefenseMatch = report.match(/Capture Defense: (\d+)\/(\d+)/);
    if (captureDefenseMatch) {
        parsedReport.captureDefense = {
            current: captureDefenseMatch[1],
            max: captureDefenseMatch[2]
        };
    }

    // Extract resources
    let resourcesMatch = report.match(/Station Resources:\s*(?:Metal\s+(\d+))?\s*(?:Gas\s+(\d+))?\s*(?:Crystal\s+(\d+))?/);
    if (resourcesMatch) {
        const [, metal, gas, crystal] = resourcesMatch;
        parsedReport.resources = {
            metal: metal,
            gas: gas,
            crystal: crystal,
        };
    } else {
        parsedReport.resources = 'None';
    }

    // Extract labor
    let laborMatch = report.match(/Station Labor:\s* Labor (\d+)/);
    if (laborMatch) {
        parsedReport.labor = laborMatch[1];
    } else {
        parsedReport.labor = 'None';
    }

    // Extract buildings
    let buildingsMatch = report.match(/Buildings: (.*?)(?=Station Hidden Resources:|Outposts:|Fleets:|Hangar:|$)/s);
    if (buildingsMatch) {
        let buildings = buildingsMatch[1].trim();
        if (buildings === 'None') {
            parsedReport.listOfBuildings = 'None';
        } else {
            let buildingMatches = buildings.matchAll(/(.*?) - Level: (\d+)/g);
            parsedReport.listOfBuildings = Array.from(buildingMatches, match => ({ name: match[1].trim(), level: parseInt(match[2]) }));
        }
    }

    // Extract hidden resources
    let hiddenResourcesMatch = report.match(/Station Hidden Resources: (.*?)(?=Outposts:|Fleets:|Hangar:|$)/s);
    if (hiddenResourcesMatch) {
        let hiddenResources = hiddenResourcesMatch[1].trim();
        if (hiddenResources === 'None') {
            parsedReport.hiddenResources = 'None';
        } else {
            let hiddenResourcesMatches = hiddenResources.split(' ');
            parsedReport.hiddenResources = {
                metal: hiddenResourcesMatches[1],
                gas: hiddenResourcesMatches[3],
                crystal: hiddenResourcesMatches[5]
            }
        }
    }

    // Extract outposts
    let outpostsMatch = report.match(/Outposts: (.*?)(?=Fleets:|Hangar:|$)/s);
    if (outpostsMatch) {
        let outposts = outpostsMatch[1].trim();
        if (outposts === 'None') {
            parsedReport.listOfOutposts = 'None';
        } else {
            let outpostMatches = outposts.split(/(?<=Operational)(?=.*? - Level)/g);
            parsedReport.listOfOutposts = outpostMatches.map(outpost => {
                let [name, level, status] = outpost.split(' - ');
                level = level.replace('Level', '');
                return { name: name.trim(), level: parseInt(level), status: status.trim() };
            });
        }
    }

    // Extract fleets
    let fleetsMatch = report.match(/Fleets: (.*?)(?=Hangar:|$)/s);
    if (fleetsMatch) {
        let fleets = fleetsMatch[1].trim();
        if (fleets === 'None') {
            parsedReport.listOfFleets = 'None';
        } else {
            let fleetMatches = fleets.matchAll(/(\d+) (\w+)/g);
            parsedReport.listOfFleets = Array.from(fleetMatches, match => ({ shipType: match[2], count: parseInt(match[1]) }));
        }
    }

    // make the total number of ships per type
    if (parsedReport.listOfFleets !== 'None') {
        let totalFleets = {};
        parsedReport.listOfFleets.forEach(fleet => {
            if (totalFleets[fleet.shipType]) {
                totalFleets[fleet.shipType] += fleet.count;
            } else {
                totalFleets[fleet.shipType] = fleet.count;
            }
        });
        parsedReport.totalFleets = totalFleets;
    } else {
        parsedReport.totalFleets = 'None';
    }

    // Extract hangar content
    let hangarMatch = report.match(/Hangar: (.*?)(?=Station Resources:|Station Labor:|Buildings:|Station Hidden Resources:|Outposts:|$)/s);
    if (hangarMatch) {
        let hangarContent = hangarMatch[1].trim();
        if (hangarContent === 'None') {
            parsedReport.hangarContent = 'None';
        } else {
            let hangarMatches = hangarContent.matchAll(/(\d+) (\w+)/g);
            parsedReport.hangarContent = Array.from(hangarMatches, match => ({ shipType: match[2], count: parseInt(match[1]) }));
        }
    }

    return parsedReport;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('send_spy_report')
        .setDescription('Send the spy report but in a nice embed')
        .addStringOption(option => option
            .setName('content')
            .setDescription('Content of the spy report, as copied by the game')
            .setRequired(true),
        ),

    async execute(bot, interaction) {
        const report = interaction.options.getString('content');

        const parsedReport = parseReport(report);

        const embed = new EmbedBuilder()
            .setColor(0xffbb00)
            .setTitle('Spy Report of ' + parsedReport.stationName)
            .setFooter({
                text: `Spy report made by ${interaction.user.username}`, iconURL: interaction.user.avatarURL({ size: 2048, dynamic: true })
            })
            .setTimestamp()
            .setFields([
                { name: 'Owner', value: parsedReport.owner, inline: true },
                { name: 'Guild', value: parsedReport.guild, inline: true },
                { name: 'Spy hour', value: parsedReport.completedTime, inline: true },
                { name: 'Detected', value: parsedReport.detected, inline: true },
                { name: 'Spy defense', value: parsedReport.spyDefense, inline: true },
                { name: 'Capture defense', value: `${parsedReport.captureDefense.current}/${parsedReport.captureDefense.max}`, inline: true },
                { name: 'Resources', value: `Metal : ${parsedReport.resources.metal}\n Gas : ${parsedReport.resources.gas}\n Crystal : ${parsedReport.resources.crystal}`, inline: true },
                { name: 'Hidden resources', value: parsedReport.hiddenResources === 'None' ? 'None' : `Metal : ${parsedReport.hiddenResources.metal}\n Gas : ${parsedReport.hiddenResources.gas}\n Crystal : ${parsedReport.hiddenResources.crystal}`, inline: true },
                { name: 'Labor', value: `${parsedReport.labor}`, inline: true },
                { name: 'Buildings', value: parsedReport.listOfBuildings === 'None' ? 'None' : parsedReport.listOfBuildings.map(building => `Level ${building.level} - ${building.name}`).join('\n') || 'None' },
                { name: 'Outposts', value: parsedReport.listOfOutposts === 'None' ? 'None' : parsedReport.listOfOutposts.map(outpost => `Level ${outpost.level} - ${outpost.name} - ${outpost.status}`).join('\n') || 'None' },
                { name: 'Fleets', value: parsedReport.listOfFleets === 'None' ? 'None' : parsedReport.listOfFleets.map(fleet => `${fleet.count} ${fleet.shipType}`).join('\n') || 'None' },
                { name: 'Total ships', value: parsedReport.totalFleets === 'None' ? 'None' : Object.entries(parsedReport.totalFleets).map(([shipType, count]) => `${count} ${shipType}`).join('\n') || 'None' },
                { name: 'Hangar content', value: parsedReport.hangarContent === 'None' ? 'None' : parsedReport.hangarContent.map(ship => `${ship.shipType} - ${ship.count}`).join('\n') || 'None' },
            ]);
        await interaction.reply({ embeds: [embed] });
    }
}
