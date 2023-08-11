const arrow = document.getElementById("arrow");

function checkScroll() {
    const scrollPosition = window.scrollY;
    const triggerPosition = 1000; // Adjust this value to determine when to trigger the animation

    if (scrollPosition > triggerPosition) {
        arrow.classList.remove("show-arrow");
    }
    console.log(scrollPosition)
}

window.addEventListener("scroll", checkScroll);
