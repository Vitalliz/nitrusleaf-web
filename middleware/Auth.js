function Auth(req, res, next){
    if (req.session.user != undefined){
        next();
    } else {
        // Redireciona para a raiz, onde está o login principal
        res.redirect("/");
    }
}
export default Auth;