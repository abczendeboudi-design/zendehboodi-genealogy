document.addEventListener("DOMContentLoaded", function () {

    const familiesBox = document.getElementById("families");

    // =========================
    // صفحه اصلی خاندان‌ها
    // =========================

    if (familiesBox) {

        const families = window.GENEALOGY_DATA?.families || [];

        if (!families.length) {
            familiesBox.innerHTML =
                `<div class="family-card">اطلاعاتی ثبت نشده است.</div>`;
            return;
        }

        familiesBox.innerHTML = families.map(function (family) {

            return `
                <div class="family-card">

                    <h3>${family.name}</h3>

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

        return;
    }


    // =========================
    // صفحه شجره‌نامه
    // =========================

    const treeBox = document.getElementById("family-tree");

    if (!treeBox) {
        return;
    }


    const people = window.PEOPLE || {};
    const relationships = window.RELATIONSHIPS || [];

    const ROOT_ID = "gholamhossein-root";


    if (!people[ROOT_ID]) {

        treeBox.innerHTML =
            `<div class="loading">سرشاخه پیدا نشد.</div>`;

        return;
    }


    // =========================
    // پیدا کردن شخص
    // =========================

    function getPerson(id) {
        return people[id] || null;
    }


    // =========================
    // پیدا کردن همسرهای شخص
    // =========================

    function getSpouses(personId) {

        return relationships
            .filter(function (r) {

                return r.type === "spouse" &&
                    (
                        r.person1 === personId ||
                        r.person2 === personId
                    );

            })
            .map(function (r) {

                const spouseId =
                    r.person1 === personId
                        ? r.person2
                        : r.person1;

                return {
                    id: spouseId,
                    person: getPerson(spouseId)
                };

            })
            .filter(function (item) {

                return item.person;

            });
    }


    // =========================
    // پیدا کردن فرزندان یک ازدواج
    // =========================

    function getChildrenWithPartner(personId, spouseId) {

        return relationships
            .filter(function (r) {

                if (r.type !== "parent") {
                    return false;
                }

                return (
                    (
                        r.parent === personId &&
                        r.spouse === spouseId
                    )
                    ||
                    (
                        r.parent === spouseId &&
                        r.spouse === personId
                    )
                );

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


    // =========================
    // ساخت کارت شخص
    // =========================

    function personButton(id, className) {

        const person = getPerson(id);

        if (!person) {
            return "";
        }

        return `
            <button
                type="button"
                class="person-card ${className || ""}"
                data-person-id="${id}"
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


    // =========================
    // ساخت خانواده یک ازدواج
    // =========================

    function buildMarriage(personId, spouseId) {

        const spouse = getPerson(spouseId);

        if (!spouse) {
            return "";
        }


        const children =
            getChildrenWithPartner(personId, spouseId);


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

                                    return personButton(
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
    }


    // =========================
    // ساخت خانواده‌های یک شخص
    // =========================

    function buildPersonFamily(personId) {

        const spouses = getSpouses(personId);


        if (!spouses.length) {

            return `
                <div class="family-info">
                    همسری ثبت نشده است.
                </div>
            `;
        }


        return spouses.map(function (spouse) {

            return buildMarriage(
                personId,
                spouse.id
            );

        }).join("");
    }


    // =========================
    // ساخت سرشاخه اصلی
    // =========================

    const root =
        getPerson(ROOT_ID);

    const rootSpouses =
        getSpouses(ROOT_ID);


    treeBox.innerHTML = `

        <div class="tree">

            <div
                class="person-card root-person"
                data-person-id="${ROOT_ID}"
            >

                <div class="person-name">
                    ${root.name}
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

                ${rootSpouses.map(function (spouse) {

                    return buildMarriage(
                        ROOT_ID,
                        spouse.id
                    );

                }).join("")}

            </div>

        </div>
    `;


    // =========================
    // نمایش خانواده شخص انتخاب‌شده
    // =========================

    function showPersonFamily(personId) {

        const person =
            getPerson(personId);

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


        content.innerHTML = `

            <div class="selected-person">

                <h2>
                    ${person.name}
                </h2>

                ${buildPersonFamily(personId)}

            </div>
        `;


        selectedBox.classList.remove("hidden");


        attachEvents();


        selectedBox.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }


    // =========================
    // فعال کردن کلیک روی افراد
    // =========================

    function attachEvents() {

        document
            .querySelectorAll("[data-person-id]")
            .forEach(function (element) {

                if (
                    element.dataset.listenerAttached === "true"
                ) {
                    return;
                }


                element.dataset.listenerAttached =
                    "true";


                element.addEventListener(
                    "click",
                    function () {

                        showPersonFamily(
                            this.dataset.personId
                        );

                    }
                );

            });
    }


    // فعال کردن کلیک‌ها
    attachEvents();


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
