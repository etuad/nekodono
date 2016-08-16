<nav id="site-navigation" class="main-navigation" role="navigation">
	<?php
	wp_nav_menu( array( 'container'      => false,
	                    'items_wrap'     => '<ul id="%1$s" class="%2$s desktop-menu" data-dropdown-menu>%3$s</ul>',
	                    'theme_location' => 'menu-1',
	                    'menu_id'        => 'top-menu',
	                    'menu_class'     => 'dropdown menu',
	                    'depth'          => 3,
	                    'fallback_cb'    => false,
	                    'walker'         => new Nekodono_Top_Bar_Walker(),
	) );
	?>
</nav>

<nav id="site-navigation-mobile" class="main-navigation-mobile" role="navigation">
	<?php
	wp_nav_menu( array( 'container'      => false,
	                    'items_wrap'     => '<ul id="%1$s" class="%2$s" data-accordion-menu>%3$s</ul>',
	                    'theme_location' => 'menu-1',
	                    'menu_id'        => 'top-menu-mobile',
	                    'menu_class'     => 'vertical menu',
	                    'fallback_cb'    => false,
	                    'walker'         => new Nekodono_Mobile_Walker(),
	) );
	?>
</nav>