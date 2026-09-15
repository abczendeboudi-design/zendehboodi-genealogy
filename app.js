document.addEventListener("DOMContentLoaded", function () {

    const familiesBox = document.getElementById("families");

    // =====================================
    // صفحه اصلی
    // =====================================

    if (familiesBox) {

        const families = window.GENEALOGY_DATA?.families || [];

        if (families.length === 0) {
            familiesBox.innerHTML =
                `<div class="family-card">اطلاعاتی ثبت نشده است.</div>`;
        } else {

            familiesBox.innerHTML = families.map(function (family) {
                return `
                    <div class="family-card">
                        <h3>${family.name}</h3>
                        <p>خاندان شماره ${family.number}</p>

                        <a
                            href="family.html?family=${family.id}"
                            class="family-button"
                        >
                            مشاهده شجره‌نامه
                        </a>
                    </div>
                `;
            }).join("");
        }

        return;
    }


    // =====================================
    // صفحه شجره‌نامه
    // =====================================

    const treeBox = document.getElementById("family-tree");

    if (!treeBox) return;

    const people = window.PEOPLE || {};
    const relationships = window.RELATIONSHIPS || [];

    const ROOT_ID = "gholamhossein-root";

    const rootPerson = people[ROOT_ID];

    if (!rootPerson) {
        treeBox.innerHTML =
            `<div class="loading">سرشاخه پیدا نشد.</div>`;
        return;
    }


    // =====================================
    // توابع اصلی
    // =====================================

    function getPerson(id) {
        return people[id] || null;
    }


    function getSpouseIds(personId) {

        return relationships
            .filter(function (r) {
                return r.type === "spouse" &&
                    (
                        r.person1 === personId ||
                        r.person2 === personId
                    );
            })
            .map(function (r) {

                return r.person1 === personId
                    ? r.person2
                    : r.person1;

            });
    }


    function getChildren(personId, spouseId) {

        return relationships
            .filter(function (r) {

                if (r.type !== "parent") return false;

                if (r.parent !== personId) return false;

                // اگر همسر مشخص شده، فقط فرزندان همان ازدواج
                if (spouseId && r.spouse !== spouseId) {
                    return false;
                }

                return true;
            })
            .map(function (r) {
                return {
                    id: r.child,
                    person: getPerson(r.child)
                };
            })
            .filter(function (item) {
                return item.person;
            });
    }


    // =====================================
    // کارت شخص
    // =====================================

    function personCard(personId, extraClass = "") {

        const person = getPerson(personId);

        if (!person) return "";

        return `
            <button
                type="button"
                class="person-card ${extraClass}"
                data-person-id="${personId}"
            >
                <span class="person-name">
                    ${person.name}
                </span>

                <span class="click-hint">
                    مشاهده خانواده
                </span>
            </button>
        `;
    }


    // =====================================
    // ساخت خانواده‌های یک شخص
    // =====================================

    function buildFamilies(personId) {

        const spouses = getSpouseIds(personId);

        // اگر همسر ندارد
        if (spouses.length === 0) {

            const children = getChildren(personId);

            return `
                <div class="family-block">

                    <div class="family-info">
                        ${children.length
                            ? `<strong>فرزندان:</strong>`
                            : `فرزندی ثبت نشده است.`}
                    </div>

                    ${
                        children.length
                            ? `
                                <div class="children-row">
                                    ${children.map(function (child) {
                                        return personCard(
                                            child.id,
                                            "child-person"
                                        );
                                    }).join("")}
                                </div>
                            `
                            : ""
                    }

                </div>
            `;
        }


        // هر همسر یک خانواده جدا
        return spouses.map(function (spouseId) {

            const spouse = getPerson(spouseId);

            if (!spouse) return "";

            const children =
                getChildren(personId, spouseId);

            return `
                <div class="family-block">

                    <div class="family-info">

                        <strong>همسر:</strong>

                        <button
                            type="button"
                            class="mini-person spouse-button"
                            data-person-id="${spouseId}"
                        >
                            ${spouse.name}
                        </button>

                    </div>


                    ${
                        children.length
                            ? `
                                <div class="family-info">
                                    <strong>فرزندان:</strong>
                                </div>

                                <div class="children-row">

                                    ${children.map(function (child) {
                                        return personCard(
                                            child.id,
                                            "child-person"
                                        );
                                    }).join("")}

                                </div>
                            `
                            : `
                                <div class="family-info">
                                    فرزندی ثبت نشده است.
                                </div>
                            `
                    }

                </div>
            `;

        }).join("");
    }


    // =====================================
    // نمایش سرشاخه
    // =====================================

    treeBox.innerHTML = `

        <div class="tree">

            <div
                class="person-card root-person"
                data-person-id="${ROOT_ID}"
            >

                <div class="person-name">
                    ${rootPerson.name}
                </div>

                <div class="person-role">
                    سرشاخه خاندان
                </div>

                <div class="click-hint">
                    مشاهده خانواده
                </div>

            </div>


            <div class="tree-line"></div>


            <div class="root-families">

                ${buildFamilies(ROOT_ID)}

            </div>

        </div>
    `;


    // =====================================
    // نمایش خانواده فرد انتخاب‌شده
    // =====================================

    function showPersonFamily(personId) {

        const person = getPerson(personId);

        if (!person) return;

        const selectedBox =
            document.getElementById("selected-family");

        const content =
            document.getElementById("selected-content");

        if (!selectedBox || !content) return;


        const spouses = getSpouseIds(personId);


        let familyHtml = "";


        // -------------------------------------
        // همسر ندارد
        // -------------------------------------

        if (spouses.length === 0) {

            const children = getChildren(personId);

            familyHtml = `

                <div class="family-block">

                    <div class="family-info">

                        ${
                            children.length
                                ? `<strong>فرزندان:</strong>`
                                : `فرزندی ثبت نشده است.`
                        }

                    </div>


                    ${
                        children.length
                            ? `
                                <div class="mini-children">

                                    ${children.map(function (child) {
                                        return `
                                            <button
                                                type="button"
                                                class="mini-person child-button"
                                                data-person-id="${child.id}"
                                            >
                                                ${child.person.name}
                                            </button>
                                        `;
                                    }).join("")}

                                </div>
                            `
                            : ""
                    }

                </div>
            `;

        }


        // -------------------------------------
        // همسر دارد
        // -------------------------------------

        else {

            familyHtml = spouses.map(function (spouseId) {

                const spouse = getPerson(spouseId);

                if (!spouse) return "";

                const children =
                    getChildren(personId, spouseId);

                return `

                    <div class="family-block">

                        <div class="family-info">

                            <strong>همسر:</strong>

                            <button
                                type="button"
                                class="mini-person spouse-button"
                                data-person-id="${spouseId}"
                            >
                                ${spouse.name}
                            </button>

                        </div>


                        ${
                            children.length
                                ? `
                                    <div class="family-info">
                                        <strong>فرزندان:</strong>
                                    </div>

                                    <div class="mini-children">

                                        ${children.map(function (child) {
                                            return `
                                                <button
                                                    type="button"
                                                    class="mini-person child-button"
                                                    data-person-id="${child.id}"
                                                >
                                                    ${child.person.name}
                                                </button>
                                            `;
                                        }).join("")}

                                    </div>
                                `
                                : `
                                    <div class="family-info">
                                        فرزندی ثبت نشده است.
                                    </div>
                                `
                        }

                    </div>
                `;

            }).join("");
        }


        // -------------------------------------
        // قرار دادن در صفحه
        // -------------------------------------

        content.innerHTML = `

            <div class="selected-person">

                <h2>${person.name}</h2>

                ${familyHtml}

            </div>
        `;


        selectedBox.classList.remove("hidden");


        // رویدادهای دکمه‌های جدید
        attachPersonEvents();


        selectedBox.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }


    // =====================================
    // فعال کردن کلیک روی افراد
    // =====================================

    function attachPersonEvents() {

        document
            .querySelectorAll("[data-person-id]")
            .forEach(function (element) {

                // جلوگیری از ثبت چندباره
                if (element.dataset.listenerAttached === "true") {
                    return;
                }

                element.dataset.listenerAttached = "true";

                element.addEventListener("click", function () {

                    const personId =
                        this.dataset.personId;

                    showPersonFamily(personId);
                });

            });
    }


    attachPersonEvents();


    // =====================================
    // عنوان صفحه
    // =====================================

    const familyTitle =
        document.getElementById("family-title");

    if (familyTitle) {

        familyTitle.textContent =
            "شجره‌نامه خاندان زنده‌بودی‌ها";

    }

});
