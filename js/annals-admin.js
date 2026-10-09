import { supabase } from "./supabase.js";

// =========================================
// ELEMENTS
// =========================================

const addAnnalButton =
    document.getElementById("addAnnalButton");

const annalFormContainer =
    document.getElementById("annalFormContainer");

const annalForm =
    document.getElementById("annalForm");

const annalFormTitle =
    document.getElementById("annalFormTitle");

const annalId =
    document.getElementById("annalId");

const annalTitle =
    document.getElementById("annalTitle");

const annalDate =
    document.getElementById("annalDate");

const annalType =
    document.getElementById("annalType");

const annalPerson =
    document.getElementById("annalPerson");

const annalDescription =
    document.getElementById("annalDescription");

const annalPhoto =
    document.getElementById("annalPhoto");

const annalPhotoFile =
    document.getElementById("annalPhotoFile");

const annalPhotoPreviewContainer =
    document.getElementById("annalPhotoPreviewContainer");

const annalPhotoPreview =
    document.getElementById("annalPhotoPreview");

const removeAnnalPhoto =
    document.getElementById("removeAnnalPhoto");
let selectedAnnalPhoto = null;
let existingAnnalPhotoUrl = "";

const annalHighlighted =
    document.getElementById("annalHighlighted");

const annalMessage =
    document.getElementById("annalMessage");

const adminAnnalsList =
    document.getElementById("adminAnnalsList");

const closeAnnalForm =
    document.getElementById("closeAnnalForm");

const cancelAnnalForm =
    document.getElementById("cancelAnnalForm");

let familyMembers = [];
let familyAnnals = [];
// Preview a photo selected from the phone
annalPhotoFile.addEventListener("change", () => {
    const file = annalPhotoFile.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        annalPhotoFile.value = "";
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert("Please choose an image smaller than 5 MB.");
        annalPhotoFile.value = "";
        return;
    }

    selectedAnnalPhoto = file;

    annalPhotoPreview.src = URL.createObjectURL(file);
    annalPhotoPreviewContainer.style.display = "block";
});

// Remove the selected photo
removeAnnalPhoto.addEventListener("click", () => {
    selectedAnnalPhoto = null;
    annalPhotoFile.value = "";
    annalPhotoPreview.src = "";
    annalPhotoPreviewContainer.style.display = "none";
});

// =========================================
// OPEN AND CLOSE FORM
// =========================================

function openAnnalForm() {
    annalForm.reset();
    annalId.value = "";
    annalFormTitle.textContent =
        "Add Historical Event";

    annalMessage.textContent = "";

    annalFormContainer.style.display = "block";

    annalFormContainer.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function closeForm() {
    annalFormContainer.style.display = "none";
    annalForm.reset();
    annalId.value = "";
    annalMessage.textContent = "";
}

addAnnalButton.addEventListener(
    "click",
    openAnnalForm
);

closeAnnalForm.addEventListener(
    "click",
    closeForm
);

cancelAnnalForm.addEventListener(
    "click",
    closeForm
);

// Upload a historical photo to Supabase Storage
async function uploadAnnalPhoto(file) {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
        throw new Error("Choose a JPG, PNG, or WebP image.");
    }

    if (file.size > 5 * 1024 * 1024) {
        throw new Error("The photo must be smaller than 5 MB.");
    }

    const extension = file.type === "image/jpeg"
        ? "jpg"
        : file.type.split("/")[1];

    const filePath =
        `annals/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
        .from("family-photos")
        .upload(filePath, file, {
            contentType: file.type,
            upsert: false
        });

    if (uploadError) {
        throw uploadError;
    }

    const { data } = supabase.storage
        .from("family-photos")
        .getPublicUrl(filePath);

    return data.publicUrl;
}
// =========================================
// LOAD FAMILY MEMBERS
// =========================================

async function loadAnnalMembers() {

    const { data, error } = await supabase
        .from("members")
        .select("id, full_name")
        .order("full_name");

    if (error) {
        console.error(
            "Could not load family members:",
            error
        );

        annalMessage.textContent =
            "Unable to load family members.";

        return;
    }

    familyMembers = data || [];

    annalPerson.innerHTML = `
        <option value="">
            No specific member
        </option>
    `;

    familyMembers.forEach(member => {

        const option =
            document.createElement("option");

        option.value = member.id;
        option.textContent = member.full_name;

        annalPerson.appendChild(option);
    });
}


// =========================================
// LOAD HISTORICAL EVENTS
// =========================================

async function loadAdminAnnals() {

    adminAnnalsList.innerHTML = `
        <p class="admin-loading">
            Loading historical events...
        </p>
    `;

    const { data, error } = await supabase
        .from("family_annals")
        .select(`
            id,
            title,
            event_date,
            event_type,
            person_id,
            description,
            photo_url,
            is_highlighted
        `)
        .order("event_date", {
            ascending: false,
            nullsFirst: false
        });

    if (error) {
        console.error(
            "Could not load family annals:",
            error
        );

        adminAnnalsList.textContent =
            "Unable to load historical events. Check the database permissions.";

        return;
    }

    familyAnnals = data || [];

    renderAdminAnnals();
}


// =========================================
// DISPLAY HISTORICAL EVENTS
// =========================================

function renderAdminAnnals() {

    adminAnnalsList.innerHTML = "";

    if (familyAnnals.length === 0) {

        adminAnnalsList.innerHTML = `
            <p class="admin-loading">
                No historical events have been added yet.
            </p>
        `;

        return;
    }

    familyAnnals.forEach(annal => {

        const member = familyMembers.find(
            person => person.id === annal.person_id
        );

        const eventCard =
            document.createElement("article");

        eventCard.className = "admin-annal-card";

        const title =
            document.createElement("h3");

        title.textContent = annal.title;

        const type =
            document.createElement("p");

        type.textContent =
            "Type: " + annal.event_type;

        const date =
            document.createElement("p");

        date.textContent =
            "Date: " +
            (annal.event_date || "Not recorded");

        const person =
            document.createElement("p");

        person.textContent =
            "Family member: " +
            (member
                ? member.full_name
                : "None specified");

        const description =
            document.createElement("p");

        description.textContent =
            annal.description || "No description provided.";

        eventCard.append(
            title,
            type,
            date,
            person,
            description
        );

        if (annal.is_highlighted) {

            const highlighted =
                document.createElement("p");

            highlighted.textContent =
                "⭐ Highlighted event";

            eventCard.appendChild(highlighted);
        }

        const editButton =
            document.createElement("button");

        editButton.type = "button";
        editButton.className =
            "admin-secondary-button";

        editButton.textContent = "Edit";

        editButton.addEventListener(
            "click",
            () => editAnnal(annal)
        );

        const deleteButton =
            document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className =
            "admin-secondary-button";

        deleteButton.textContent = "Delete";

        deleteButton.addEventListener(
            "click",
            () => deleteAnnal(annal)
        );

        const buttons =
            document.createElement("div");

        buttons.className = "admin-form-buttons";

        buttons.append(
            editButton,
            deleteButton
        );

        eventCard.appendChild(buttons);

        adminAnnalsList.appendChild(eventCard);
    });
}


// =========================================
// SAVE HISTORICAL EVENT
// =========================================

annalForm.addEventListener("submit", async event => {
    event.preventDefault();

    try {
        // Check that all required form elements exist
const requiredFields = {
    annalId,
    annalTitle,
    annalDate,
    annalType,
    annalPerson,
    annalDescription,
    annalPhoto,
    annalHighlighted
};

for (const [name, element] of Object.entries(requiredFields)) {
    if (!element) {
        throw new Error(
            "Missing HTML element: " + name +
            ". Please check its ID in admin.html."
        );
    }
}

const title = annalTitle.value.trim();
const eventType = annalType.value;
        if (!title || !eventType) {
            annalMessage.textContent =
                "Please enter an event title and type.";
            return;
        }

        const eventData = {
            title: title,
            event_date: annalDate.value || null,
            event_type: eventType,
            person_id: annalPerson.value || null,
            description: annalDescription.value.trim() || null,
            photo_url: annalPhoto.value.trim() || null,
            is_highlighted: annalHighlighted.checked
        };

        // Upload a new photo if one was selected.
        if (selectedAnnalPhoto) {
            annalMessage.textContent = "Uploading photo...";

            eventData.photo_url =
                await uploadAnnalPhoto(selectedAnnalPhoto);
        }

        annalMessage.textContent =
            "Saving historical event...";

        let result;

        if (annalId.value) {
            result = await supabase
                .from("family_annals")
                .update(eventData)
                .eq("id", annalId.value);
        } else {
            result = await supabase
                .from("family_annals")
                .insert([eventData]);
        }

        if (result.error) {
            console.error(
                "Error saving historical event:",
                result.error
            );

            annalMessage.textContent =
                "Save failed: " + result.error.message;

            return;
        }

        alert(
            annalId.value
                ? "Historical event updated successfully."
                : "Historical event saved successfully."
        );

        closeForm();
        await loadAdminAnnals();

    } catch (error) {
        console.error("Historical event save error:", error);

        annalMessage.textContent =
            "Error: " + error.message;
    }
});


// =========================================
// EDIT HISTORICAL EVENT
// =========================================

function editAnnal(annal) {

    annalId.value = annal.id;

    annalTitle.value =
        annal.title || "";

    annalDate.value =
        annal.event_date || "";

    annalType.value =
        annal.event_type || "";

    annalPerson.value =
        annal.person_id || "";

    annalDescription.value =
        annal.description || "";

    annalPhoto.value =
        annal.photo_url || "";

    annalHighlighted.checked =
        Boolean(annal.is_highlighted);

    annalFormTitle.textContent =
        "Edit Historical Event";

    annalMessage.textContent = "";

    annalFormContainer.style.display = "block";

    annalFormContainer.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// =========================================
// DELETE HISTORICAL EVENT
// =========================================

async function deleteAnnal(annal) {

    const confirmed = confirm(
        `Are you sure you want to delete "${annal.title}"?`
    );

    if (!confirmed) {
        return;
    }

    const { error } = await supabase
        .from("family_annals")
        .delete()
        .eq("id", annal.id);

    if (error) {

        console.error(
            "Error deleting historical event:",
            error
        );

        alert(
            "Could not delete the event. Check administrator permissions."
        );

        return;
    }

    alert(
        "Historical event deleted successfully."
    );

    await loadAdminAnnals();
}


// =========================================
// INITIALIZE
// =========================================

async function initializeAnnalsAdmin() {

    await loadAnnalMembers();

    await loadAdminAnnals();
}

initializeAnnalsAdmin();
