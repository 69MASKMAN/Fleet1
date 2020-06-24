$(".cross_bar").click(() => {
    $(".c_1").addClass("hide")
    $(".c_2").addClass("col-lg-12")
    $(".menu_bar").addClass("display")
})
$(".menu_bar").click(() => {
    $(".c_1").removeClass("hide")
    $(".c_2").removeClass("col-lg-12")
    $(".menu_bar").removeClass("display")
})
