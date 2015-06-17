var _ = require('lodash');

function generatePostList(posts) {
    var postsData = [];

    posts.forEach(function (post) {
        var postData = {
            slug:       post.slug,
            title:      post.title,
            markdown:   post._content,
            categories: post.categories.map(function (category) {
                return {
                    name:   category.name,
                    slug:   category.slug,
                    length: category.length
                };
            }),
            tags:       post.tags.map(function (tag) {
                return {
                    name:   tag.name,
                    slug:   tag.slug,
                    length: tag.length
                };
            })
        };

        postsData.push(postData);
    });

    return postsData;
}

hexo.extend.generator.register('api', function (locals) {
    var config      = this.config;
    var apiConfig   = config.api;
    var theme       = this.theme;
    var themeConfig = theme.config;
    var menuConfig  = themeConfig.menu || {};

    var apiEntries     = [];
    var postsData      = [];
    var pagesData      = [];
    var categoriesData = [];
    var tagsData       = [];
    var menuData       = {
        categories: [],
        tags:       [],
        navigation: []
    };

    var posts = locals.posts.sort('-date');
    posts.forEach(function (post) {
        var postData = {
            slug:       post.slug,
            title:      post.title,
            markdown:   post._content,
            categories: post.categories.map(function (category) {
                return {
                    name:   category.name,
                    slug:   category.slug,
                    length: category.length
                };
            }),
            tags:       post.tags.map(function (tag) {
                return {
                    name:   tag.name,
                    slug:   tag.slug,
                    length: tag.length
                };
            })
        };

        apiEntries.push({
            path: 'api/posts/' + post.slug + '.json',
            data: JSON.stringify(postData, null, '    ')
        });

        _.forOwn(menuConfig, function(label, itemConfig) {
            console.log(itemConfig);
        });
    });

    apiEntries.push({
        path: 'api/posts.json',
        data: JSON.stringify(postsData, null, '    ')
    });


    var pages = locals.pages.sort('+name');
    pages.forEach(function (page) {
        console.log(page.permalink);
        var pageData = {
            slug:     page.slug,
            title:    page.title,
            markdown: page._content
        };

        apiEntries.push({
            path: 'api/pages/' + page.slug + '.json',
            data: JSON.stringify(pageData)
        })
    });


    var categories = locals.categories.sort('+name');
    categories.forEach(function (category) {
        var categoryData = {
            name:   category.name,
            slug:   category.slug,
            length: category.length,
            posts:  generatePostList(category.posts)
        };

        apiEntries.push({
            path: 'api/categories/' + category.slug + '.json',
            data: JSON.stringify(categoryData, null, '    ')
        });

        categoriesData.push(categoryData);

        menuData.categories.push(categoryData);
    });

    var tags = locals.tags.sort('+name');
    tags.forEach(function (tag) {
        var tagData = {
            name:   tag.name,
            slug:   tag.slug,
            length: tag.length,
            posts:  generatePostList(tag.posts)
        };

        apiEntries.push({
            path: 'api/tags/' + tag.slug + '.json',
            data: JSON.stringify(tagData, null, '    ')
        });

        tagsData.push(tagData);

        menuData.tags.push(tagData);
    });

    console.log(menuConfig);
    _.forOwn(menuConfig, function (itemConfig, label) {
        switch (itemConfig.type) {
            case 'category':
                var category = _.find(categoriesData, { slug: itemConfig.slug });
                if (category === undefined) {
                    throw new Error('Unable to find category ' + JSON.stringify(itemConfig));
                }
                menuData.navigation.push({
                    label: label,
                    type:  itemConfig.type,
                    slug:  category.slug
                });
                break;

            case 'tag':
                var tag = _.find(tagsData, { slug: itemConfig.slug });
                if (tag === undefined) {
                    throw new Error('Unable to find tag ' + JSON.stringify(itemConfig));
                }
                menuData.navigation.push({
                    label: label,
                    type:  itemConfig.type,
                    slug:  tag.slug
                });
                break;
        }
    });

    apiEntries.push({
        path: 'api/menu.json',
        data: JSON.stringify(menuData, null, '    ')
    });


    return apiEntries;
});