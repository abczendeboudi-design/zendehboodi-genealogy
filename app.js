document.addEventListener("DOMContentLoaded", function () {

    const familiesBox = document.getElementById("families");

    if (!familiesBox) {
        return;
    }

    familiesBox.innerHTML = `
        <div class="family-card">
            <h3>خاندان زنده‌بودی‌ها</h3>

            <p>
                شجره‌نامه در حال آماده‌سازی است...
            </p>
        </div>
    `;

});
