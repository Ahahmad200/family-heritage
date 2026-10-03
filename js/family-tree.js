import { supabase } from "./supabase.js";

const familyTree = document.getElementById("familyTree");

async function loadFamilyTree() {

    familyTree.innerHTML = `
        <p class="loading-tree">Loading our family tree...</p>
    `;

    // Get all family members
    const { data: members, error: membersError } = await supabase
        .from("members")
        .select(`
            id,
            full_name,
            is_deceased,
            photo_url,
            biography
        `);

    if (membersError) {
        console.error(membersError);

        familyTree.innerHTML = `
            <p class="tree-error">
                Unable to load family members.
            </p>
        `;

        return;
    }


    // Get all family relationships
    const { data: relationships, error: relationshipsError } =
        await supabase
            .from("relationships")
            .select(`
                person_id,
                related_person_id,
                relationship_type
            `);

    if (relationshipsError) {
        console.error(relationshipsError);

        familyTree.innerHTML = `
            <p class="tree-error">
                Unable to load family relationships.
            </p>
        `;

        return;
    }


    // Find the Patriarch
    const patriarch = members.find(
        member =>
            member.full_name ===
            "Alh Aliyu Abdulmuninu Gandu"
    );


    // Find the Matriarch
    const matriarch = members.find(
        member =>
            member.full_name ===
            "Haj Aisha Mukhtar"
    );


    if (!patriarch || !matriarch) {

        familyTree.innerHTML = `
            <p class="tree-error">
                The main family couple could not be found.
            </p>
        `;

        return;
    }


    /*
       Find the children who are connected
       to BOTH the Patriarch and Matriarch.

       This is important because the Patriarch
       also has a son from his previous marriage.
    */

    const patriarchChildren = relationships
        .filter(
            relationship =>
                relationship.related_person_id === patriarch.id &&
                relationship.relationship_type === "child"
        )
        .map(
            relationship =>
                relationship.person_id
        );


    const matriarchChildren = relationships
        .filter(
            relationship =>
                relationship.related_person_id === matriarch.id &&
                relationship.relationship_type === "child"
        )
        .map(
            relationship =>
                relationship.person_id
        );


    // Children belonging to BOTH parents
    const commonChildren = patriarchChildren.filter(
        id => matriarchChildren.includes(id)
    );


    const children = members
        .filter(member =>
            commonChildren.includes(member.id)
        );


    // Sort children by name for now
    children.sort((a, b) =>
        a.full_name.localeCompare(b.full_name)
    );


    // Create the main tree
    familyTree.innerHTML = "";


    const tree = document.createElement("div");

    tree.className = "family-tree";


    // =========================
    // CENTRAL COUPLE
    // =========================

    const couple = document.createElement("div");

    couple.className = "central-couple";


    couple.innerHTML = `
        ${createMemberCard(
            patriarch,
            "Patriarch"
        )}

        <div class="marriage-symbol">
            ❤️
        </div>

        ${createMemberCard(
            matriarch,
            "Matriarch"
        )}
    `;


    tree.appendChild(couple);


    // Connecting line
    const mainLine = document.createElement("div");

    mainLine.className = "main-connector";

    tree.appendChild(mainLine);


    // =========================
    // CHILDREN
    // =========================

    const childrenTitle = document.createElement("h3");

    childrenTitle.className = "generation-title";

    childrenTitle.textContent =
        `Their Children (${children.length})`;

    tree.appendChild(childrenTitle);


    const childrenContainer = document.createElement("div");

    childrenContainer.className = "children-grid";


    children.forEach(child => {

        const childCard = document.createElement("div");

        childCard.innerHTML =
            createMemberCard(
                child,
                "Child of Alh Aliyu & Haj Aisha"
            );

        childrenContainer.appendChild(childCard);

    });


    tree.appendChild(childrenContainer);


    familyTree.appendChild(tree);

}


/*
    Creates a family member card.
*/

function createMemberCard(member, relationship) {

    const status = member.is_deceased
        ? "Deceased"
        : "Living";


    const photo = member.photo_url
        ? `
            <img
                src="${member.photo_url}"
                alt="${member.full_name}"
            >
        `
        : `
            <div class="member-photo-placeholder">
                ${getInitials(member.full_name)}
            </div>
        `;


    return `
        <div
            class="member-card
            ${member.is_deceased ? "deceased" : ""}"
        >

            <div class="member-photo">
                ${photo}
            </div>

            <div class="member-info">

                <h4>
                    ${member.full_name}
                </h4>

                <p class="member-relationship">
                    ${relationship}
                </p>

                <p class="member-status">
                    ${status}
                </p>

            </div>

        </div>
    `;
}


/*
    Creates initials when no photo exists.
*/

function getInitials(name) {

    const words = name.trim().split(" ");

    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }

    return (
        words[0].charAt(0) +
        words[words.length - 1].charAt(0)
    ).toUpperCase();
}


loadFamilyTree();
