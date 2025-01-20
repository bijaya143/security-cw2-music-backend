const { fetch, remove } = require("../model/userFavorite");
const {
  storeUserFavorite,
  validateUserFavorite,
} = require("../service/userFavoriteService");

const createUserFavorite = async (req, res, next) => {
  try {
    const favorite = await storeUserFavorite(req.userId, req.body.songId);
    return res.json({
      success: true,
      data: {
        favorite,
        message: "Song has been added to the favorite.",
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: {
        message: error.message,
      },
    });
  }
};
const getUserFavorites = async (req, res, next) => {
  const { limit, page } = req.query;
  const paginationParams = {
    limit: limit,
    skip: (page - 1) * limit,
  };
  try {
    const favorite = await fetch({ userId: req.userId }, paginationParams);
    return res.json({
      success: true,
      data: {
        favorite,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: {
        message: error.message,
      },
    });
  }
};
const removeUserFavorite = async (req, res, next) => {
  const favorite = await validateUserFavorite(req.userId, req.params.songId);
  if (!favorite) {
    return res.status(404).json({
      success: false,
      data: {
        message: "Favorite song does not exist.",
      },
    });
  } else {
    try {
      await remove(favorite._id);
      return res.json({
        success: true,
        data: {
          message: "Song has been removed from the favorites.",
        },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        data: {
          message: error.message,
        },
      });
    }
  }
};

const getUserFavorite = async (req, res, next) => {
  const favorite = await validateUserFavorite(req.userId, req.params.songId);
  if (!favorite) {
    return res.status(404).json({
      success: false,
      data: {
        message: "Favorite song does not exist.",
      },
    });
  } else {
    try {
      return res.json({
        success: true,
        data: {
          favorite,
        },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        data: {
          message: error.message,
        },
      });
    }
  }
};

module.exports = {
  createUserFavorite,
  getUserFavorites,
  removeUserFavorite,
  getUserFavorite,
};
