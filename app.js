document.addEventListener("DOMContentLoaded", function () {

    const familiesBox = document.getElementById("families");

    // =========================
    // صفحه خاندان‌ها
    // =========================

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
                        <a href="family.html?family=${family.id}" class="family-button">
                            مشاهده شجره‌نامه
                        </a>
                    </div>
                `;
            }).join("");
        }

        return;
    }


    // =========================
    // صفحه شجره‌نامه
    // =========================

    const treeBox = document.getElementById("family-tree");

    if (!treeBox) return;

    const people = window.PEOPLE || {};
    const relationships = window.RELATIONSHIPS || [];

    const rootPerson = people["gholamhossein-root"];

    if (!rootPerson) {
        treeBox.innerHTML =
            `<div class="loading">سرشاخه پیدا نشد.</div>`;
        return;
    }


    // =========================
    // ابزارهای کمکی
    // =========================

    function getPerson(personId) {
        return people[personId] || null;
    }

    function getSpouses(personId) {
        return relationships
            .filter(function (relationship) {
                return relationship.type === "spouse" &&
                    (
                        relationship.person1 === personId ||
                        relationship.person2 === personId
                    );
            })
            .map(function (relationship) {
                const spouseId =
                    relationship.person1 === personId
                        ? relationship.person2
                        : relationship.person1;

                return {
                    id: spouseId,
                    person: getPerson(spouseId)
                };
            })
            .filter(function (item) {
                return item.person;
            });
    }

    function getChildren(personId) {
        return relationships
            .filter(function (relationship) {
                return relationship.type === "parent" &&
                    relationship.parent === personId;
            })
            .map(function (relationship) {
                return {
                    id: relationship.child,
                    person: getPerson(relationship.child),
                    spouse: relationship.spouse
                        ? getPerson(relationship.spouse)
                        : null
                };
            })
            .filter(function (item) {
                return item.person;
            });
    }


    // =========================
    // ساخت کارت شخص
    // =========================

    function personCard(personId, extraClass = "") {

        const person = getPerson(personId);

        if (!person) return "";

        return `
            <button
                class="person-card ${extraClass}"
                data-person-id="${personId}"
            >
                <span class="person-name">${person.name}</span>
                <span class="click-hint">مشاهده خانواده</span>
            </button>
        `;
    }


    // =========================
    // نمایش سرشاخه
    // =========================

    const rootSpouses = getSpouses(rootPerson.id || "gholamhossein-root");
    const rootChildren = getChildren("gholamhossein-root");

    treeBox.innerHTML = `
        <div class="tree">

            <div class="person-card root-person" data-person-id="gholamhossein-root">
                <div class="person-name">${rootPerson.name}</div>
                <div class="person-role">سرشاخه خاندان</div>
                <div class="click-hint">مشاهده خانواده</div>
            </div>

            ${
                rootSpouses.length
                    ? `
                        <div class="family-info tree-spouses">
                            <strong>همسر:</strong>
                            ${rootSpouses.map(function (item) {
                                return `
                                    <button
                                        class="mini-person spouse-button"
                                        data-person-id="${item.id}"
                                    >
                                        ${item.person.name}
                                    </button>
                                `;
                            }).join("")}
                        </div>
                    `
                    : ""
            }

            <div class="tree-line"></div>

            <div class="children-row">
                ${
                    rootChildren.map(function (child) {
                        return personCard(child.id, "child-person");
                    }).join("")
                }
            </div>

        </div>
    `;


    // =========================
    // کلیک روی افراد
    // =========================

    function attachPersonEvents() {

        document
            .querySelectorAll("[data-person-id]")
            .forEach(function (element) {

                element.addEventListener("click", function () {

                    const personId = this.dataset.personId;

                    showPersonFamily(personId);
                });

            });
    }

    attachPersonEvents();


    // =========================
    // نمایش خانواده شخص
    // =========================

    function showPersonFamily(personId) {

        const person = getPerson(personId);

        if (!person) return;

        const selectedBox =
            document.getElementById("selected-family");

        const content =
            document.getElementById("selected-content");

        if (!selectedBox || !content) return;

        const spouses = getSpouses(personId);
        const children = getChildren(personId);


        // =========================
        // خانواده همسرها
        // =========================

        let spousesHtml = "";

        if (spouses.length > 0) {

            spousesHtml = `
                <div class="family-info">
                    <strong>همسر:</strong>

                    <div class="mini-children">
                        ${
                            spouses.map(function (item) {
                                return `
                                    <button
                                        class="mini-person spouse-button"
                                        data-person-id="${item.id}"
                                    >
                                        ${item.person.name}
                                    </button>
                                `;
                            }).join("")
                        }
                    </div>
                </div>
            `;
        }


        // =========================
        // فرزندان
        // =========================

        let childrenHtml = "";

        if (children.length > 0) {

            childrenHtml = `
                <div class="family-info">
                    <strong>فرزندان:</strong>

                    <div class="mini-children">
                        ${
                            children.map(function (child) {
                                return `
                                    <button
                                        class="mini-person child-button"
                                        data-person-id="${child.id}"
                                    >
                                        ${child.person.name}
                                    </button>
                                `;
                            }).join("")
                        }
                    </div>
                </div>
            `;

        } else {

            childrenHtml = `
                <div class="family-info">
                    فرزندی ثبت نشده است.
                </div>
            `;
        }


        // =========================
        // نمایش اطلاعات
        // =========================

        content.innerHTML = `
            <div class="selected-person">

                <h2>${person.name}</h2>

                ${spousesHtml}

                ${childrenHtml}

            </div>
        `;

        selectedBox.classList.remove("hidden");

        attachPersonEvents();

        selectedBox.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }


    // =========================
    // عنوان صفحه
    // =========================

    const familyTitle =
        document.getElementById("family-title");

    if (familyTitle) {
        familyTitle.textContent =
            "شجره‌نامه خاندان زنده‌بودی‌ها";
    }

});
