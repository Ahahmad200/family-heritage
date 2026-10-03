import { supabase } from "./supabase.js";


const familyTree = document.getElementById("familyTree");


async function loadFamilyMembers() {

    familyTree.innerHTML = `
        <p>Loading family members...</p>
    `;


    const { data, error } = await supabase
        .from("members")
        .select(`
            id,
            full_name,
            gender,
            date_of_birth,
            place_of_birth,
            photo_url,
            biography,
            is_deceased,
            date_of_death
        `)
        .order("full_name");


    if (error) {

        console.error(error);

        familyTree.innerHTML = `
            <p>Unable to load family members.</p>
        `;

        return;
    }


    if (!data || data.length === 0) {

        familyTree.innerHTML = `
            <p>No family members found.</p>
        `;

        return;
    }


    familyTree.innerHTML = "";


    data.forEach(member => {

        const card = document.createElement("div");

        card.className = "family-member-card";


        card.innerHTML = `
            <h3>${member.full_name}</h3>

            <p>
                ${member.is_deceased ? "Deceased" : "Living"}
            </p>
        `;


        familyTree.appendChild(card);

    });

}


loadFamilyMembers();
