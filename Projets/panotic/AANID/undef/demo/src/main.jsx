import React from 'react';
import { createRoot } from 'react-dom/client';
import PostsReseaux from './PostsReseaux';
import Consultation from './Consultation';

const rootPosts = createRoot(document.getElementById('screen-posts'));
rootPosts.render(<PostsReseaux />);

const rootConsult = createRoot(document.getElementById('screen-consult'));
rootConsult.render(<Consultation />);
