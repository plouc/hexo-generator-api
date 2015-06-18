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

        postsData.push(postData);
    });

    apiEntries.push({
        path: 'api/posts.json',
        data: JSON.stringify(postsData, null, '    ')
    });


    var pages = locals.pages.sort('+name');
    pages.forEach(function (page) {
        // http://me.com/Resume/Pro/index.html -> Resume/Pro
        var pageSlug = page.permalink.slice(config.url.length + 1, -11);

        var pageData = {
            slug:     pageSlug,
            title:    page.title,
            markdown: page._content,
            comment:  page.comment,
            share:    page.share
        };

        apiEntries.push({
            path: 'api/pages/' + pageSlug + '.json',
            data: JSON.stringify(pageData)
        });

        pagesData.push(pageData);
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


    _.forOwn(menuConfig, function (itemConfig, label) {
        var collection;

        switch (itemConfig.type) {
            case 'external':
                menuData.navigation.push({
                    label: label,
                    type:  itemConfig.type,
                    url:   itemConfig.url
                });
                return;

            case 'category': collection = categoriesData; break;
            case 'tag':      collection = tagsData;       break;
            case 'page':     collection = pagesData;      break;

            default:
                throw new Error('Invalid menu item type "' + itemConfig.type +  '"');
                break;
        }

        var item = _.find(collection, { slug: itemConfig.slug });
        if (item === undefined) {
            throw new Error('Unable to find menu item "' + itemConfig.type +  '" ' + JSON.stringify(itemConfig));
        }

        menuData.navigation.push({
            label: label,
            type:  itemConfig.type,
            slug:  itemConfig.slug
        });
    });

    apiEntries.push({
        path: 'api/menu.json',
        data: JSON.stringify(menuData, null, '    ')
    });


    return apiEntries;
});