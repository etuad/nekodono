<nav id="site-navigation" class="main-navigation" role="navigation">
	<button class="menu-toggle" aria-controls="top-menu" aria-expanded="false"><?php esc_html_e( 'Menu', 'nekodono' ); ?></button>
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
