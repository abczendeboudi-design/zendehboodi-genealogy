document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // صفحه اصلی
    // ==========================================

    const familiesBox = document.getElementById("families");

    if (familiesBox) {

        const families = window.GENEALOGY_DATA?.families || [];

        if (families.length === 0) {

            familiesBox.innerHTML = `
                <div class="family-card">
                    اطلاعاتی ثبت نشده است.
                </div>
            `;

        } else {

            familiesBox.innerHTML = families.map(function (family) {

                return `
                    <div class="family-card">

                        <h3>
                            ${family.name}
                        </h3>

                        <p>
                            خاندان شماره ${family.number}
                        </p>

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


    // ==========================================
    // صفحه شجره‌نامه
    // ==========================================

    const treeBox = document.getElementById("family-tree");

    if (!treeBox) {
        return;
    }


    const people = window.PEOPLE || {};
    const relationships = window.RELATIONSHIPS || [];


    // ------------------------------------------
    // پیدا کردن سرشاخه
    // ------------------------------------------

    const rootPerson = people["person-1"];


    if (!rootPerson) {

        treeBox.innerHTML = `
            <div class="loading">
                سرشاخه پیدا نشد.
            </div>
        `;

        return;
    }


    // ------------------------------------------
    // نمایش درخت
    // ------------------------------------------

    const children = relationships
        .filter(function (relationship) {

            return (
                relationship.type === "parent" &&
                relationship.parent === "person-1"
            );

        })
        .map(function (relationship) {

            return people[relationship.child];

        })
        .filter(Boolean);


    treeBox.innerHTML = `

        <div class="tree">

            <div class="person-card root-person">

                <div class="person-name">
                    ${rootPerson.name}
                </div>

                <div class="person-role">
                    سرشاخه
                </div>

            </div>


            <div class="tree-line"></div>


            <div class="children-row">

                ${children.map(function (person) {

                    const personId = Object.keys(people).find(function (id) {

                        return people[id] === person;

                    });

                    return `

                        <button
                            class="person-card child-person"
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

                }).join("")}

            </div>

        </div>

    `;


    // ------------------------------------------
    // کلیک روی فرزند
    // ------------------------------------------

    document
        .querySelectorAll(".child-person")
        .forEach(function (button) {

            button.addEventListener("click", function () {

                const personId =
                    this.dataset.personId;

                showPersonFamily(personId);

            });

        });


    // ==========================================
    // نمایش خانواده شخص
    // ==========================================

    function showPersonFamily(personId) {

        const person = people[personId];

        if (!person) {
            return;
        }


        const selectedBox =
            document.getElementById("selected-family");

        const content =
            document.getElementById("selected-content");


        if (!selectedBox || !content) {
            return;
        }


        // همسر
        const spouses = relationships
            .filter(function (relationship) {

                return (
                    relationship.type === "spouse" &&
                    (
                        relationship.person1 === personId ||
                        relationship.person2 === personId
                    )
                );

            })
            .map(function (relationship) {

                const spouseId =
                    relationship.person1 === personId
                        ? relationship.person2
                        : relationship.person1;

                return people[spouseId];

            })
            .filter(Boolean);


        // فرزندان
        const children = relationships
            .filter(function (relationship) {

                return (
                    relationship.type === "parent" &&
                    relationship.parent === personId
                );

            })
            .map(function (relationship) {

                return people[relationship.child];

            })
            .filter(Boolean);


        content.innerHTML = `

            <div class="selected-person">

                <h2>
                    ${person.name}
                </h2>

                ${
                    spouses.length
                        ? `
                            <div class="family-info">

                                <strong>
                                    همسر:
                                </strong>

                                ${spouses
                                    .map(function (spouse) {
                                        return spouse.name;
                                    })
                                    .join("، ")}

                            </div>
                          `
                        : ""
                }


                ${
                    children.length
                        ? `

                            <div class="family-info">

                                <strong>
                                    فرزندان:
                                </strong>

                                <div class="mini-children">

                                    ${children
                                        .map(function (child) {

                                            return `
                                                <span class="mini-person">
                                                    ${child.name}
                                                </span>
                                            `;

                                        })
                                        .join("")}

                                </div>

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


        selectedBox.classList.remove("hidden");


        selectedBox.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }

});
