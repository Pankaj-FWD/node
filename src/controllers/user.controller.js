const User = require("../schema/user.schema");
const Post = require("../schema/post.schema");

module.exports.getUsersWithPostCount = async (req, res) => {
  try {
    //TODO: Implement this API
   if(!req.query.limit){
    req.query.limit =10
    var limit = 10
   }
   else{
    var limit = Number(req.query.limit)
   }
   if(!req.query.page){
    req.query.page = 1
    var page = 1
   }
   else{
    var page = Number(req.query.page)
   }
  
    let count = await User.find().count() 
    const data = await User.aggregate([
      {
        $match: {
        }
      },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'userId',
          as: 'output_post'
        }
      },
   
      { "$facet": {
        "users": [
          {
            $project: {
              _id: 1,
              name: 1,
              posts: {$size:"$output_post"}
            }},
        { "$skip": limit*(page-1) },
          { "$limit": limit },
        ],
        "pagination": [
          
          { $count: "totalDocs"},
          {$addFields:{limit:Number(limit)}},
          {$addFields:{page:Number(page)}},
          {$addFields:{totalPages:Math.ceil(count/limit)}},
          {$addFields:{pagingCounter:Number(limit*(page-1)+1)}},
          {$addFields:{hasPrevPage:{$cond:{if:page > 1, then:true, else:false}}}},
          {$addFields:{hasNextPage:{$cond:{if:page >=(count/limit), then:false, else:true}}}},
          {$addFields:{prevPage:{$cond:{if:page <= 1, then:null, else:page-1}}}},
          {$addFields:{nextPage:{$cond:{if:page >=(count/limit), then:null, else:page+1}}}}

          
        
        ]
      }}
    ])

    manipulateddata = {"data":{"users":data[0]["users"],"pagination":data[0]["pagination"][0]}}
    res.status(200).json(manipulateddata);
  } catch (error) {
    res.send({ error: error.message });
  }
};
