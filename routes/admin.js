var express = require('express');
const { getMaxListeners } = require("../app");
var router = express.Router();
const adminControl = require('../controller/admincontrol')
const adminHelper = require('../helpers/adminHelpers')
const db = require('../model/connection')
const multer = require('multer')
const photoload = require('../multer/multer')
const authentication = require('../middleware/middlewares')



router.get('/',authentication.adminAuth,adminControl.displayDashboard)

//login
router.route('/login')
.get(adminControl.getAdminLogin)
    .post(adminControl.postAdminLogin)
    
//logout
router.get('/logout',adminControl.adminLogout)




//userlist
router.get('/view-users',authentication.adminAuth,adminControl.getUserlist)

router.get('/block-users/:id',authentication.adminAuth,adminControl.blockTheUser)

router.get('/unblock-users/:id',authentication.adminAuth,adminControl.unblockTheUser)


//product
router.route("/add-product")
        .all(authentication.adminAuth)
        .get(adminControl.addProducts)
        .post(photoload.uploads, adminControl.postProducts)




router.get('/view-product',authentication.adminAuth, adminControl.viewProducts)



router.route('/edit-product/:id')
        .all(authentication.adminAuth)
        .get(adminControl.editProduct)
        .post(photoload.editeduploads,adminControl.post_EditProduct)

//category
router.route('/add-category')
        .all(authentication.adminAuth)
        .get(adminControl.getCategory)
        .post(adminControl.postCategory)


router.post('/delete-product',adminControl.deleteTheProduct)

router.get("/delete-category/:id",authentication.adminAuth,adminControl.deleteCategory)

router.get('/edit-category/:id',authentication.adminAuth,adminControl.editTheCategory)

router.post('/edit-category/:id',authentication.adminAuth,adminControl.postEditCategory)

router.get('/orders-list',authentication.adminAuth,adminControl.getOrderList)

router.get('/order-details',authentication.adminAuth,adminControl.getOrderDetails)

router.post("/order-details", authentication.adminAuth, adminControl.postOrderDetails)

router.get('/view-discount', authentication.adminAuth,adminControl.getDiscount)

router.post('/delete-coupon/:id',authentication.adminAuth,adminControl.removeCoupon)

router.post('/addCoupon', authentication.adminAuth,adminControl.addNewCoupon)

router.get('/sales-report',authentication.adminAuth,adminControl.getSalesreport)

router.post('/sales_report',authentication.adminAuth,adminControl.salesReport)

router.post('/search-item',authentication.adminAuth,adminControl.searchItem)

router.post('/search-item-coupon',authentication.adminAuth,adminControl.searchItemCoupon)
























module.exports = router;