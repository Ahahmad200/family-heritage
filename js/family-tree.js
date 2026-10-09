import { supabase } from "./supabase.js";

const familyTree = document.getElementById("familyTree");

window.familyMembers = [];


// =========================================
// LOAD FAMILY TREE
// =========================================

async function loadFamilyTree() {

    familyTree.innerHTML = `
        <p class="loading-tree">
            Loading our family tree...
        </p>
    `;


    // =========================================
    // LOAD MEMBERS
    // =========================================

    const {
        data: members,
        error: membersError
    } = await supabase
        .from("members")
        .select(`
    id,
    full_name,
    gender,
    is_deceased,
    photo_url,
    biography,
    date_of_birth,
    place_of_birth
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


    window.familyMembers = members;
loadRelationshipMembers();

    // =========================================
    // LOAD RELATIONSHIPS
    // =========================================

    const {
        data: relationships,
        error: relationshipsError
    } = await supabase
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
window.familyRelationships = relationships;

    // =========================================
    // FIND FOUNDING COUPLE
    // =========================================

    const patriarch = members.find(
        member =>
            member.full_name ===
            "Alh Aliyu Abdulmuninu Gandu"
    );


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


    // =========================================
    // CLEAR TREE
    // =========================================

    familyTree.innerHTML = "";


    const tree =
        document.createElement("div");

    tree.className =
        "family-tree";


    // =========================================
    // FOUNDING COUPLE
    // =========================================

    const couple =
        document.createElement("div");

    couple.className =
        "central-couple";


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


    // =========================================
    // MAIN CONNECTOR
    // =========================================

    const mainLine =
        document.createElement("div");

    mainLine.className =
        "main-connector";


    tree.appendChild(mainLine);


    // =========================================
    // GET THE 10 CHILDREN
    // =========================================

    const fatherChildren =
        getChildren(
            patriarch.id,
            relationships,
            members
        );


    const motherChildren =
        getChildren(
            matriarch.id,
            relationships,
            members
        );


    // Only children belonging to BOTH parents
    // are shown as the central couple's children.

    const firstGeneration =
        fatherChildren.filter(
            child =>
                motherChildren.some(
                    motherChild =>
                        motherChild.id === child.id
                )
        );


    // =========================================
    // GENERATION TITLE
    // =========================================

    const title =
        document.createElement("h3");

    title.className =
        "generation-title";

    title.textContent =
        `Their Children (${firstGeneration.length})`;


    tree.appendChild(title);


    // =========================================
    // FIRST GENERATION CONTAINER
    // =========================================

    const generationContainer =
        document.createElement("div");

    generationContainer.className =
        "recursive-family-tree";


    // =========================================
    // CREATE ONLY THE 10 CHILDREN VISIBLY
    // =========================================

    firstGeneration.forEach(child => {

        const branch =
            createGenerationBranch(
                child,
                relationships,
                members,
                1
            );

        generationContainer.appendChild(
            branch
        );

    });


    tree.appendChild(
        generationContainer
    );


    familyTree.appendChild(tree);

}


// =========================================
// GET CHILDREN
// =========================================

function getChildren(
    parentId,
    relationships,
    members
) {

    return relationships
        .filter(
            relationship =>
                relationship.related_person_id === parentId &&
                relationship.relationship_type === "child"
        )
        .map(
            relationship =>
                members.find(
                    member =>
                        member.id === relationship.person_id
                )
        )
        .filter(Boolean);

}


// =========================================
// CREATE GENERATION BRANCH
// =========================================

function createGenerationBranch(
    member,
    relationships,
    members,
    generation
) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "generation-branch";


    // =========================================
    // MEMBER CARD
    // =========================================

    wrapper.innerHTML =
        createMemberCard(
            member,
            getGenerationLabel(generation)
        );


    // =========================================
    // FIND CHILDREN
    // =========================================

    const children =
        getChildren(
            member.id,
            relationships,
            members
        );


    // =========================================
    // NO CHILDREN
    // =========================================

    if (children.length === 0) {

        return wrapper;

    }


    // =========================================
    // DESCENDANTS CONTAINER
    // =========================================

    const descendants =
        document.createElement("div");

    descendants.className =
        "collapsible-descendants";


    // =========================================
    // SHOW / HIDE BUTTON
    // =========================================

    const toggleButton =
        document.createElement("button");

    toggleButton.type =
        "button";

    toggleButton.className =
        "show-descendants-button";


    toggleButton.innerHTML =
    `
        ✨ Explore ${member.full_name}'s Branch
        ▼
    `;


    // =========================================
    // CHILDREN CONTAINER
    // =========================================

    const childrenContainer =
        document.createElement("div");

    childrenContainer.className =
        "generation-children";


    // =========================================
    // CREATE DESCENDANTS
    // =========================================

    children.forEach(child => {

        const childBranch =
            createGenerationBranch(
                child,
                relationships,
                members,
                generation + 1
            );


        childrenContainer.appendChild(
            childBranch
        );

    });


    descendants.appendChild(
        childrenContainer
    );


    // =========================================
    // IMPORTANT:
    // HIDE ALL DESCENDANTS INITIALLY
    // =========================================

    descendants.style.display =
        "none";


    // =========================================
    // BUTTON CLICK
    // =========================================

    toggleButton.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();


            const isHidden =
                descendants.style.display ===
                "none";


            if (isHidden) {

                descendants.style.display =
                    "block";


                toggleButton.innerHTML =
                    `
                        ✨ Hide descendants ▲
                    `;

            } else {

                descendants.style.display =
                    "none";


                toggleButton.innerHTML =
    `
        ✨ Explore ${member.full_name}'s Branch
        ▼
    `;

            }

        }
    );


    // =========================================
    // ADD BUTTON
    // =========================================

    wrapper.appendChild(
        toggleButton
    );


    // =========================================
    // ADD HIDDEN DESCENDANTS
    // =========================================

    wrapper.appendChild(
        descendants
    );


    return wrapper;

}


// =========================================
// GENERATION LABEL
// =========================================

function getGenerationLabel(generation) {

    if (generation === 1) {

        return "Child of Alh Aliyu & Haj Aisha";

    }


    if (generation === 2) {

        return "Grandchild";

    }


    if (generation === 3) {

        return "Great-grandchild";

    }


    if (generation === 4) {

        return "4th Generation Descendant";

    }


    return `${generation + 1}th Generation Descendant`;

}


// =========================================
// MEMBER CARD
// =========================================

function createMemberCard(
    member,
    relationship
) {

    const status =
        member.is_deceased
            ? "Deceased"
            : "Living";


    const photo =
        member.photo_url

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
            class="
                member-card
                ${member.is_deceased ? "deceased" : ""}
            "
            data-member-id="${member.id}"
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


// =========================================
// INITIALS
// =========================================

function getInitials(name) {

    const words =
        name.trim().split(" ");


    if (words.length === 1) {

        return words[0]
            .charAt(0)
            .toUpperCase();

    }


    return (
        words[0].charAt(0) +
        words[words.length - 1].charAt(0)
    ).toUpperCase();

}


// =========================================
// MEMBER BIOGRAPHY POPUP
// =========================================

const memberModal =
    document.getElementById("memberModal");

const modalMemberContent =
    document.getElementById("modalMemberContent");

const closeMemberModal =
    document.getElementById("closeMemberModal");


function openMemberModal(member) {

    const status =
        member.is_deceased
            ? "Deceased"
            : "Living";


    const statusClass =
        member.is_deceased
            ? "deceased"
            : "";


    const photo =
        member.photo_url

            ? `
                <img
                    src="${member.photo_url}"
                    alt="${member.full_name}"
                >
            `

            : `
                <div class="modal-member-placeholder">
                    ${getInitials(member.full_name)}
                </div>
            `;


    const biography =
        member.biography
            ? member.biography
            : "Biography will be added soon.";


    modalMemberContent.innerHTML = `

        <div class="modal-member-photo">

            ${photo}

        </div>


        <h2 class="modal-member-name">
            ${member.full_name}
        </h2>


        <p class="modal-member-status ${statusClass}">
            ${status}
        </p>


        <div class="modal-member-details">

            ${
                member.date_of_birth
                    ? `
                        <p>
                            🎂
                            <strong>Date of Birth:</strong>
                            ${member.date_of_birth}
                        </p>
                    `
                    : ""
            }


            ${
                member.place_of_birth
                    ? `
                        <p>
                            📍
                            <strong>Place of Birth:</strong>
                            ${member.place_of_birth}
                        </p>
                    `
                    : ""
            }

        </div>


        <div class="modal-member-biography">

            <h3 class="modal-member-biography-title">
                Biography
            </h3>

            <p>
                ${biography}
            </p>

        </div>

    `;


    memberModal.style.display =
        "flex";

}
// Allow other pages to open a family member's profile.
window.openFamilyMemberProfile = function(memberId) {
    const member = window.familyMembers?.find(
        person => person.id === memberId
    );

    if (member && memberModal && modalMemberContent) {
        openMemberModal(member);
    }
};

// =========================================
// CLOSE MEMBER MODAL
// =========================================

function closeMemberModalWindow() {

    memberModal.style.display =
        "none";

}


closeMemberModal.addEventListener(
    "click",
    closeMemberModalWindow
);


memberModal.addEventListener(
    "click",
    function(event) {

        if (event.target === memberModal) {

            closeMemberModalWindow();

        }

    }
);


// =========================================
// CLICK MEMBER CARD
// =========================================

document.addEventListener(
    "click",
    function(event) {

        const card =
            event.target.closest(
                ".member-card"
            );


        if (!card) {

            return;

        }


        const memberId =
            card.dataset.memberId;


        const member =
            window.familyMembers?.find(
                member =>
                    member.id === memberId
            );


        if (member) {

            openMemberModal(member);

        }

    }
);

// =========================================
// HOW AM I RELATED - LOAD MEMBERS
// =========================================

const relationshipPerson =
    document.getElementById("relationshipPerson");

const relatedPerson =
    document.getElementById("relatedPerson");


function loadRelationshipMembers() {

    if (!relationshipPerson || !relatedPerson) {
        return;
    }


    relationshipPerson.innerHTML = `
        <option value="">
            Select family member
        </option>
    `;


    relatedPerson.innerHTML = `
        <option value="">
            Select family member
        </option>
    `;


    window.familyMembers
        .slice()
        .sort((a, b) =>
            a.full_name.localeCompare(
                b.full_name
            )
        )
        .forEach(member => {

            const option1 =
                document.createElement("option");

            option1.value =
                member.id;

            option1.textContent =
                member.full_name;

            relationshipPerson.appendChild(
                option1
            );


            const option2 =
                document.createElement("option");

            option2.value =
                member.id;

            option2.textContent =
                member.full_name;

            relatedPerson.appendChild(
                option2
            );

        });

}
// =========================================
// HOW AM I RELATED - FIND RELATIONSHIP
// =========================================

const calculateRelationshipButton =
    document.getElementById(
        "calculateRelationshipButton"
    );

const relationshipResult =
    document.getElementById(
        "relationshipResult"
    );


if (calculateRelationshipButton) {

    calculateRelationshipButton.addEventListener(
        "click",
        function() {

            const startId =
                relationshipPerson.value;

            const targetId =
                relatedPerson.value;


            // -------------------------------
            // VALIDATION
            // -------------------------------

            if (!startId || !targetId) {

                relationshipResult.innerHTML = `
                    <div class="relationship-message">
                        ⚠️ Please select both family members.
                    </div>
                `;

                return;
            }


            if (startId === targetId) {

                const member =
                    window.familyMembers.find(
                        person =>
                            person.id === startId
                    );


                relationshipResult.innerHTML = `
                    <div class="relationship-message success">
                        🌳 You selected the same person.
                        <strong>${member.full_name}</strong>
                        is connected to themselves.
                    </div>
                `;

                return;
            }


            // -------------------------------
            // BUILD FAMILY CONNECTIONS
            // -------------------------------

            const connections = {};


            window.familyMembers.forEach(
                member => {

                    connections[member.id] = [];

                }
            );


            // -------------------------------
            // ADD RELATIONSHIPS
            // -------------------------------

            window.familyRelationships.forEach(
                relationship => {

                    const person =
                        relationship.person_id;

                    const related =
                        relationship.related_person_id;


                    if (
                        relationship.relationship_type ===
                        "child"
                    ) {

                        // Child → Parent

                        connections[person].push(
                            related
                        );


                        // Parent → Child

                        connections[related].push(
                            person
                        );

                    }


                    if (
                        relationship.relationship_type ===
                        "spouse"
                    ) {

                        connections[person].push(
                            related
                        );

                        connections[related].push(
                            person
                        );

                    }

                }
            );


            // -------------------------------
            // FIND PATH USING BFS
            // -------------------------------

            const queue = [
                [startId]
            ];

            const visited =
                new Set([startId]);


            let foundPath = null;


            while (queue.length > 0) {

                const path =
                    queue.shift();

                const current =
                    path[path.length - 1];


                if (current === targetId) {

                    foundPath = path;

                    break;

                }


                const neighbours =
                    connections[current] || [];


                for (
                    const neighbour
                    of neighbours
                ) {

                    if (
                        !visited.has(
                            neighbour
                        )
                    ) {

                        visited.add(
                            neighbour
                        );


                        queue.push([
                            ...path,
                            neighbour
                        ]);

                    }

                }

            }


            // -------------------------------
            // NO CONNECTION
            // -------------------------------

            if (!foundPath) {

                relationshipResult.innerHTML = `
                    <div class="relationship-message">
                        🌿 No recorded connection
                        was found between these
                        two family members.
                    </div>
                `;

                return;
            }


            // -------------------------------
            // CREATE PATH DISPLAY
            // -------------------------------

            const pathMembers =
                foundPath.map(
                    id =>
                        window.familyMembers.find(
                            member =>
                                member.id === id
                        )
                );


            const directRelationship =
    getDirectRelationship(
        startId,
        targetId
    );

const extendedRelationship =
    getExtendedRelationship(
        startId,
        targetId
    );

const relationshipName =
    directRelationship ||
    extendedRelationship ||
    "family relative";

const startMember =
    window.familyMembers.find(
        member =>
            member.id === startId
    );

const targetMember =
    window.familyMembers.find(
        member =>
            member.id === targetId
    );

let relationshipSentence = "";

if (relationshipName === "parent") {

    relationshipSentence = `
        <strong>
            ${startMember.full_name}
        </strong>
        is the
        <strong>child</strong>
        of
        <strong>
            ${targetMember.full_name}
        </strong>.
    `;

} else if (relationshipName === "child") {

    relationshipSentence = `
        <strong>
            ${startMember.full_name}
        </strong>
        is the
        <strong>parent</strong>
        of
        <strong>
            ${targetMember.full_name}
        </strong>.
    `;

} else if (
    relationshipName === "grandparent"
) {

    relationshipSentence = `
        <strong>
            ${startMember.full_name}
        </strong>
        is the
        <strong>grandchild</strong>
        of
        <strong>
            ${targetMember.full_name}
        </strong>.
    `;

} else if (
    relationshipName === "grandchild"
) {

    relationshipSentence = `
        <strong>
            ${startMember.full_name}
        </strong>
        is the
        <strong>grandparent</strong>
        of
        <strong>
            ${targetMember.full_name}
        </strong>.
    `;

} else if (
    relationshipName === "brother or sister"
) {

    relationshipSentence = `
        <strong>
            ${startMember.full_name}
        </strong>
        and
        <strong>
            ${targetMember.full_name}
        </strong>
        are
        <strong>siblings</strong>.
    `;

} else if (
    relationshipName === "spouse"
) {

    relationshipSentence = `
        <strong>
            ${startMember.full_name}
        </strong>
        is the
        <strong>spouse</strong>
        of
        <strong>
            ${targetMember.full_name}
        </strong>.
    `;

} else if (
    relationshipName === "uncle"
) {

    relationshipSentence = `
        <strong>
            ${startMember.full_name}
        </strong>
        is the
        <strong>uncle</strong>
        of
        <strong>
            ${targetMember.full_name}
        </strong>.
    `;

} else if (
    relationshipName === "aunt"
) {

    relationshipSentence = `
        <strong>
            ${startMember.full_name}
        </strong>
        is the
        <strong>aunt</strong>
        of
        <strong>
            ${targetMember.full_name}
        </strong>.
    `;

} else if (
    relationshipName === "nephew"
) {

    relationshipSentence = `
        <strong>
            ${startMember.full_name}
        </strong>
        is the
        <strong>nephew</strong>
        of
        <strong>
            ${targetMember.full_name}
        </strong>.
    `;

} else if (
    relationshipName === "niece"
) {

    relationshipSentence = `
        <strong>
            ${startMember.full_name}
        </strong>
        is the
        <strong>niece</strong>
        of
        <strong>
            ${targetMember.full_name}
        </strong>.
    `;

} else if (
    relationshipName === "cousin"
) {

    relationshipSentence = `
        <strong>
            ${startMember.full_name}
        </strong>
        and
        <strong>
            ${targetMember.full_name}
        </strong>
        are
        <strong>cousins</strong>.
    `;

} else {

    relationshipSentence = `
        <strong>
            ${startMember.full_name}
        </strong>
        is a
        <strong>
            ${relationshipName}
        </strong>
        of
        <strong>
            ${targetMember.full_name}
        </strong>.
    `;
}


relationshipResult.innerHTML = `
    <div class="relationship-path-card">

        <h3>
            🌳 Family Relationship
        </h3>

        <div class="relationship-description">
            ${relationshipSentence}
        </div>

        <p class="relationship-path-intro">
            🌿 The recorded family path is:
        </p>

        <div class="relationship-path">

            ${pathMembers.map(
                (member, index) => `

                    <div
                        class="
                            relationship-path-member
                        "
                    >

                        <div
                            class="
                                relationship-path-number
                            "
                        >
                            ${index + 1}
                        </div>

                        <strong>
                            ${member.full_name}
                        </strong>

                    </div>

                    ${
                        index <
                        pathMembers.length - 1
                            ? `
                                <div
                                    class="
                                        relationship-path-line
                                    "
                                >
                                    ↓
                                </div>
                            `
                            : ""
                    }

                `
            ).join("")}

        </div>

    </div>
`;

        }
    );

}
// =========================================
// FAMILY RELATIONSHIP INTELLIGENCE
// =========================================

function getParents(memberId) {

    return (window.familyRelationships || [])
        .filter(relationship =>
            relationship.person_id === memberId &&
            relationship.relationship_type === "child"
        )
        .map(relationship =>
            relationship.related_person_id
        );
}


function getChildrenOf(memberId) {

    return (window.familyRelationships || [])
        .filter(relationship =>
            relationship.related_person_id === memberId &&
            relationship.relationship_type === "child"
        )
        .map(relationship =>
            relationship.person_id
        );
}


function getSpouses(memberId) {

    return (window.familyRelationships || [])
        .filter(relationship =>
            relationship.relationship_type === "spouse" &&
            (
                relationship.person_id === memberId ||
                relationship.related_person_id === memberId
            )
        )
        .map(relationship =>
            relationship.person_id === memberId
                ? relationship.related_person_id
                : relationship.person_id
        );
}


function getSiblings(memberId) {

    const parents =
        getParents(memberId);

    const siblings = new Set();

    parents.forEach(parentId => {

        getChildrenOf(parentId)
            .forEach(childId => {

                if (childId !== memberId) {
                    siblings.add(childId);
                }

            });

    });

    return [...siblings];
}


function getMemberName(memberId) {

    const member =
        window.familyMembers.find(
            person =>
                person.id === memberId
        );

    return member
        ? member.full_name
        : "Unknown family member";
}


function getDirectRelationship(
    startId,
    targetId
) {

    // Same person
    if (startId === targetId) {
        return "the same person";
    }


    // Spouse
    if (
        getSpouses(startId)
            .includes(targetId)
    ) {
        return "spouse";
    }


    // Parent
    if (
        getParents(startId)
            .includes(targetId)
    ) {
        return "parent";
    }


    // Child
    if (
        getChildrenOf(startId)
            .includes(targetId)
    ) {
        return "child";
    }


    // Sibling
    if (
        getSiblings(startId)
            .includes(targetId)
    ) {
        return "brother or sister";
    }


    // Grandparent
    const grandparents =
        getParents(startId)
            .flatMap(parentId =>
                getParents(parentId)
            );

    if (
        grandparents.includes(targetId)
    ) {
        return "grandparent";
    }


    // Grandchild
    const grandchildren =
        getChildrenOf(startId)
            .flatMap(childId =>
                getChildrenOf(childId)
            );

    if (
        grandchildren.includes(targetId)
    ) {
        return "grandchild";
    }


    return null;
}
// =========================================
// EXTENDED FAMILY RELATIONSHIPS
// =========================================

function getUnclesAndAunts(memberId) {

    const parents =
        getParents(memberId);

    const relatives = new Set();

    parents.forEach(parentId => {

        getSiblings(parentId)
            .forEach(siblingId => {

                relatives.add(siblingId);

            });

    });

    return [...relatives];
}


function getNiecesAndNephews(memberId) {

    const siblings =
        getSiblings(memberId);

    const relatives = new Set();

    siblings.forEach(siblingId => {

        getChildrenOf(siblingId)
            .forEach(childId => {

                relatives.add(childId);

            });

    });

    return [...relatives];
}


function getCousins(memberId) {

    const unclesAndAunts =
        getUnclesAndAunts(memberId);

    const cousins = new Set();

    unclesAndAunts.forEach(relativeId => {

        getChildrenOf(relativeId)
            .forEach(childId => {

                cousins.add(childId);

            });

    });

    return [...cousins];
}


// =========================================
// SMART EXTENDED FAMILY RELATIONSHIPS
// =========================================

function getExtendedRelationship(
    startId,
    targetId
) {

    const startMember =
        window.familyMembers.find(
            member =>
                member.id === startId
        );

    const targetMember =
        window.familyMembers.find(
            member =>
                member.id === targetId
        );

    if (!startMember || !targetMember) {
        return null;
    }


    // =========================================
    // START PERSON IS UNCLE OR AUNT
    // =========================================

    const targetParents =
        getParents(targetId);

    for (const parentId of targetParents) {

        const parentSiblings =
            getSiblings(parentId);

        if (
            parentSiblings.includes(
                startId
            )
        ) {

            if (
                startMember.gender &&
                startMember.gender.toLowerCase() ===
                "male"
            ) {
                return "uncle";
            }

            if (
                startMember.gender &&
                startMember.gender.toLowerCase() ===
                "female"
            ) {
                return "aunt";
            }

            return "uncle or aunt";
        }
    }


    // =========================================
    // START PERSON IS NEPHEW OR NIECE
    // =========================================

    const startParents =
        getParents(startId);

    for (const parentId of startParents) {

        const parentSiblings =
            getSiblings(parentId);

        if (
            parentSiblings.includes(
                targetId
            )
        ) {

            if (
                startMember.gender &&
                startMember.gender.toLowerCase() ===
                "male"
            ) {
                return "nephew";
            }

            if (
                startMember.gender &&
                startMember.gender.toLowerCase() ===
                "female"
            ) {
                return "niece";
            }

            return "nephew or niece";
        }
    }


    // =========================================
    // COUSIN
    // =========================================

    const startParentsForCousin =
        getParents(startId);

    const targetParentsForCousin =
        getParents(targetId);

    for (
        const startParentId
        of startParentsForCousin
    ) {

        const startParentSiblings =
            getSiblings(startParentId);

        for (
            const targetParentId
            of targetParentsForCousin
        ) {

            if (
                startParentSiblings.includes(
                    targetParentId
                )
            ) {
                return "cousin";
            }
        }
    }


    return null;
}
// =========================================
// START
// =========================================

loadFamilyTree();
